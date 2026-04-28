import type { SqliteClientFactory } from "./internal/worker.ts"

import { Migrator } from "@effect-x/db/migrator"
import * as Reactivity from "@effect/experimental/Reactivity"
import * as SqlClient from "@effect/sql/SqlClient"
import * as Config from "effect/Config"
import * as Context from "effect/Context"
import * as Deferred from "effect/Deferred"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import { flow, pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Match from "effect/Match"
import * as Option from "effect/Option"
import * as Ref from "effect/Ref"
import * as RuntimeFlags from "effect/RuntimeFlags"
import * as Scope from "effect/Scope"
import * as Stream from "effect/Stream"
import * as String from "effect/String"
import { createBroadcastChannel } from "./internal/broadcast-channel.ts"
import * as Weblock from "./internal/lock.ts"
import { SqliteRuntimeEvents } from "./internal/runtime-events.ts"
import * as Worker from "./internal/worker.ts"
import { handleRelayServer, initSqlite, runRelayClient } from "./relay.ts"
import * as SqliteSchema from "./schema.ts"

const SQLITE_LOCK = "SQLITE_LOCK"

const CHANNEL_NAME = "SQLITE_BROADCAST_INTERNAL"

const withSqlClient = <A, E, R>(effect: (client: Worker.SqlClient) => Effect.Effect<A, E, R>) => {
  return Effect.context<never>().pipe(
    Effect.flatMap((context) => effect(Context.unsafeGet(context, SqlClient.SqlClient) as Worker.SqlClient))
  )
}

export const workerHandles = () =>
  Effect.map(Effect.scope, (scope) => ({
    SqliteQueryExecute: (execute: SqliteSchema.SqliteQueryExecute) => {
      const run = withSqlClient((client) => {
        if (execute.rowMode === "array") {
          return client.unsafe(execute.sql, execute.params).values
        }
        return client.unsafe(execute.sql, execute.params).withoutTransform
      })

      return pipe(
        run,
        Effect.tapErrorCause((cause) =>
          Effect.logTrace("worker query failure", cause).pipe(
            Effect.annotateLogs({
              ...execute
            })
          )
        ),
        Effect.provideService(Scope.Scope, scope),
        Effect.withTracerEnabled(false),
        Effect.withLogSpan("@sqlite")
      )
    },
    SqliteQueryStreamExecute: (execute: SqliteSchema.SqliteQueryStreamExecute) =>
      pipe(
        withSqlClient((client) => Effect.succeed(client.runStream(execute.sql, execute.params))),
        Effect.provideService(Scope.Scope, scope),
        Effect.withTracerEnabled(false),
        Effect.withLogSpan("@sqlite"),
        Stream.unwrapScoped,
        Stream.onError((cause) =>
          Effect.logTrace("worker stream query failure", cause).pipe(Effect.annotateLogs({ ...execute }))
        ),
        Stream.provideService(Scope.Scope, scope)
      ),
    SqliteExportExecute: () =>
      pipe(
        withSqlClient((client) => client.export),
        Effect.tapErrorCause((cause) => Effect.logTrace("worker export failure", cause)),
        Effect.provideService(Scope.Scope, scope),
        Effect.withTracerEnabled(false),
        Effect.withLogSpan("@sqlite")
      ),
    SqliteImportExecute: (event: SqliteSchema.SqliteImportExecute) =>
      pipe(
        withSqlClient((client) => client.import(event.data)),
        Effect.tapErrorCause((cause) => Effect.logTrace("worker import failure", cause)),
        Effect.provideService(Scope.Scope, scope),
        Effect.withTracerEnabled(false),
        Effect.withLogSpan("@sqlite")
      ),
    SqliteStorageSize: () =>
      withSqlClient((client) => {
        const sqlite3Api = client.config.sqlite3Api

        return sqlite3Api.getUsedSize
      }),
    SqliteStreamEvent: () =>
      pipe(
        Effect.map(SqliteRuntimeEvents, (runtimeEvents) => runtimeEvents.stream),
        Stream.unwrap,
        Stream.onError((cause) => Effect.logTrace("worker stream event failure", cause))
      )
  }))

interface SqliteClientConfig extends Omit<Worker.SqliteClientConfig, "sqlite3Api"> {
  dbName: string
  cleanupOnClose?: boolean
  fkEnabled: boolean
}

const runMainBootstrap = ({
  fkEnabled,
  sqlite3Api,
  transformQueryNames,
  transformResultNames,
  spanAttributes
}: {
  readonly fkEnabled: boolean
  readonly sqlite3Api: SqliteClientFactory
  readonly spanAttributes?: Worker.SqliteClientConfig["spanAttributes"]
  readonly transformResultNames?: Worker.SqliteClientConfig["transformResultNames"]
  readonly transformQueryNames?: Worker.SqliteClientConfig["transformQueryNames"]
}) =>
  Effect.gen(function* () {
    const sqlClient = yield* Worker.make({
      sqlite3Api,
      ...(spanAttributes ? { spanAttributes } : {}),
      ...(transformQueryNames ? { transformQueryNames } : {}),
      ...(transformResultNames ? { transformResultNames } : {})
    })

    yield* applyWorkerPragmas({ fkEnabled }).pipe(Effect.provideService(SqlClient.SqlClient, sqlClient))
  })

const make = Effect.fn("sqlite-worker.init")(
  function* (options: SqliteClientConfig) {
    const SQLITE_LOCK_NAME = `${options.dbName}-${SQLITE_LOCK}`
    const SQLITE_CHANNEL_NAME = `${options.dbName}-${CHANNEL_NAME}`

    const scope = yield* Effect.scope
    const relayScope = yield* Scope.fork(scope, scope.strategy)
    const clientRef = yield* Ref.make<Option.Option<SqliteClientFactory>>(Option.none())

    const lockDeferred = yield* Deferred.make<void>()
    const lock = yield* Weblock.getForDeferredLock(lockDeferred, SQLITE_LOCK_NAME)

    const reactivity = yield* Reactivity.Reactivity
    const runtimeEvents = yield* SqliteRuntimeEvents

    const reactivityUpdate = Match.type<SqliteSchema.SqliteUpdateEvent>().pipe(
      Match.tag("SqliteUpdateHookEvent", ({ table, rowid }) => reactivity.invalidate({ [table]: [rowid] })),
      Match.orElse(() => Effect.void)
    )

    const publishRuntimeEvent = (event: SqliteSchema.SqliteUpdateEvent) =>
      Effect.provide(runtimeEvents.publish(event), RuntimeFlags.disableRuntimeMetrics)

    const publishClientRuntimeEvent = Match.type<SqliteSchema.SqliteUpdateEvent>().pipe(
      Match.tag("SqliteUpdateHookEvent", ({ db, table }) =>
        publishRuntimeEvent(
          new SqliteSchema.SqliteInvalidateTablesEvent(
            {
              db,
              tables: [table]
            },
            { disableValidation: true }
          )
        )
      ),
      Match.orElse(publishRuntimeEvent)
    )

    const handleUpdate = flow(
      Effect.succeed<SqliteSchema.SqliteUpdateEvent>,
      Effect.tap(reactivityUpdate),
      Effect.tap(publishClientRuntimeEvent)
    )

    yield* Effect.addFinalizer(() => Deferred.done(lockDeferred, Exit.void))

    const initMain = Effect.gen(function* () {
      let hasReady = false
      const readyLatch = yield* Effect.makeLatch(hasReady)
      const channel = yield* createBroadcastChannel(SQLITE_CHANNEL_NAME, readyLatch.whenOpen)
      const dbName = String.kebabToSnake(options.dbName)
      const sqlite = yield* initSqlite({ dbName, cleanupOnClose: options.cleanupOnClose })

      yield* Effect.addFinalizer(() => channel.close)

      yield* Effect.forkScoped(
        readyLatch.whenOpen(
          Effect.sync(() => {
            hasReady = true
          })
        )
      )

      const clientFactory = yield* handleRelayServer({
        channel,
        sqlite3: sqlite.sqlite3,
        db: sqlite.db,
        onUpdate: handleUpdate,
        hasReady: () => hasReady
      })

      yield* runMainBootstrap({
        fkEnabled: options.fkEnabled,
        sqlite3Api: clientFactory,
        spanAttributes: options.spanAttributes,
        transformQueryNames: options.transformQueryNames,
        transformResultNames: options.transformResultNames
      })

      yield* Ref.set(clientRef, Option.some(clientFactory))

      yield* readyLatch.open
      yield* publishRuntimeEvent(new SqliteSchema.SqliteLockChangeHookEvent({ lockAcquire: true }))
    })

    const initClient = Effect.gen(function* () {
      const readyLatch = yield* Effect.makeLatch(false)
      const channel = yield* createBroadcastChannel(SQLITE_CHANNEL_NAME, readyLatch.whenOpen)

      yield* Effect.addFinalizer(() => channel.close)

      // Use worker-proxy to send the instructions of the current tab to another tab to wait for the results, while accepting updates from other tabs.
      const clientFactory = yield* runRelayClient({ channel, onUpdate: handleUpdate })

      yield* Ref.set(clientRef, Option.some(clientFactory))

      yield* readyLatch.open
      yield* publishRuntimeEvent(new SqliteSchema.SqliteLockChangeHookEvent({ lockAcquire: false }))
    })

    yield* Effect.annotateCurrentSpan({
      "lock.acquire": lock ? "acquire" : "none"
    })

    if (lock) {
      // Accept the call of another tab to return the result. The updates generated by the current tab will also be sent to other tas.
      yield* Scope.extend(initMain, relayScope)
    } else {
      // if lock is undefined, then we need to wait for the deferred to be resolved
      yield* Scope.extend(initClient, relayScope)

      yield* pipe(
        Effect.logTrace("wait lock release"),
        Effect.zipRight(Weblock.waitForDeferredLock(lockDeferred, SQLITE_LOCK_NAME)),
        // 获得 lock，切换到为主 worker-wasm
        Effect.tap(Effect.logTrace("lock acquired")),
        Effect.zipRight(Scope.extend(initMain, scope)),
        Effect.zipRight(Scope.close(relayScope, Exit.void)),
        Effect.forkScoped,
        Effect.provide(RuntimeFlags.disableRuntimeMetrics)
      )
    }

    const clientFactoryOption = yield* Ref.get(clientRef)

    if (Option.isNone(clientFactoryOption)) {
      return yield* Effect.dieMessage("client factory is none")
    }

    return Worker.layer({
      sqlite3Api: {
        run: (sql, params, rowMode) =>
          Ref.get(clientRef).pipe(
            Effect.flatten,
            Effect.flatMap((client) => client.run(sql, params, rowMode)),
            Effect.catchTag("NoSuchElementException", Effect.die)
          ),
        runStream: (sql, params) =>
          Ref.get(clientRef).pipe(
            Effect.flatten,
            Effect.map((client) => client.runStream(sql, params)),
            Effect.catchTag("NoSuchElementException", Effect.die),
            Stream.unwrap
          ),
        export: Ref.get(clientRef).pipe(
          Effect.flatten,
          Effect.flatMap((client) => client.export),
          Effect.catchTag("NoSuchElementException", Effect.die)
        ),
        import: (data) =>
          Ref.get(clientRef).pipe(
            Effect.flatten,
            Effect.flatMap((client) => client.import(data)),
            Effect.catchTag("NoSuchElementException", Effect.die)
          ),
        getUsedSize: Ref.get(clientRef).pipe(
          Effect.flatten,
          Effect.flatMap((client) => client.getUsedSize),
          Effect.catchTag("NoSuchElementException", Effect.die)
        )
      },
      ...options
    })
  },
  Effect.withLogSpan("@sqlite"),
  Effect.annotateLogs({ module: "SqliteWorker" }),
  Effect.withSpan("sqlite-worker.init")
)

export const applyWorkerPragmas = Effect.fn("applyWorkerPragmas")(
  function* (
    {
      fkEnabled
    }: {
      fkEnabled?: boolean
    } = { fkEnabled: false }
  ) {
    const sql = yield* SqlClient.SqlClient
    yield* sql`
      PRAGMA page_size=8192;
      PRAGMA journal_mode=WAL;
      PRAGMA temp_store=MEMORY;
      PRAGMA synchronous=NORMAL;
      PRAGMA cache_size=4000;
      PRAGMA locking_mode=EXCLUSIVE;
      PRAGMA busy_timeout=5000;
      PRAGMA read_uncommitted=OFF;
      PRAGMA recursive_triggers=OFF;
      PRAGMA soft_heap_limit=134217728;
      ${fkEnabled ? sql`PRAGMA foreign_keys='ON';` : sql`PRAGMA foreign_keys='OFF';`}
    `
    const migrator = yield* Effect.serviceOption(Migrator)
    yield* Option.match(migrator, {
      onNone: () => Effect.void,
      onSome: (service) => service.start
    })
  },
  Effect.withTracerEnabled(false),
  Effect.orDie
)

export const layer = (options: SqliteClientConfig) =>
  Layer.provideMerge(Layer.unwrapScoped(make(options)), SqliteRuntimeEvents.Live)

export const layerConfig = (options: Config.Config.Wrap<SqliteClientConfig>) =>
  pipe(
    Config.unwrap(options),
    Effect.map((_) => Layer.provideMerge(Layer.unwrapScoped(make(_)), SqliteRuntimeEvents.Live)),
    Layer.unwrapEffect
  )

const SqliteConfig = Config.all({
  SQLITE_NAME: Config.string("NAME").pipe(
    Config.nested("DB"),
    Config.orElse(() =>
      Config.all([Config.string("NAMESPACE"), Config.string("NAME")]).pipe(Config.map((_) => _.join("-")))
    )
  ),
  SQLITE_FK: Config.boolean("FK").pipe(
    Config.withDefault(false),
    Config.orElse(() => Config.succeed(false)),
    Config.nested("DB")
  ),
  SQLITE_CAMEL: Config.boolean("CAMEL").pipe(
    Config.withDefault(true),
    Config.orElse(() => Config.succeed(true)),
    Config.nested("DB")
  )
})

export const SqliteLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const { SQLITE_NAME, SQLITE_FK, SQLITE_CAMEL } = yield* SqliteConfig

    return layer({
      dbName: SQLITE_NAME,
      fkEnabled: SQLITE_FK,
      ...(SQLITE_CAMEL
        ? {
            transformQueryNames: String.camelToSnake,
            transformResultNames: String.snakeToCamel
          }
        : {})
    })
  })
)
