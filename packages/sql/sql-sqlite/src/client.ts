import * as Reactivity from "@effect/experimental/Reactivity"
import * as Config from "effect/Config"
import * as Context from "effect/Context"
import * as DefaultServices from "effect/DefaultServices"
import * as Effect from "effect/Effect"
import * as FiberRef from "effect/FiberRef"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Match from "effect/Match"
import * as RuntimeFlags from "effect/RuntimeFlags"
import * as Stream from "effect/Stream"
import * as String from "effect/String"
import * as Internal from "./internal/client.ts"
import * as Pool from "./pool.ts"
import { RelayClient } from "./relay-client.ts"
import * as SqliteSchema from "./schema.ts"

const LOG_SPAN = "@sql-client"

type SqliteRuntimeEventHandler = (event: SqliteSchema.SqliteUpdateEvent) => Effect.Effect<void>

export const getUnsafeSqlClient = Effect.context<never>().pipe(
  Effect.map((context) => Context.unsafeGet(context, Internal.SqlClient) as Internal.SqlClient)
)

export const withSqlClient = <A, E, R>(effect: (client: Internal.SqlClient) => Effect.Effect<A, E, R>) =>
  getUnsafeSqlClient.pipe(Effect.flatMap(effect))

const publishLockAcquireDebugState = (lockAcquire: boolean) =>
  Effect.sync(() => {
    const target = globalThis as typeof globalThis & {
      __x_sqlite_lockAcquire?: boolean
      __x_sqlite_lockAcquireChange?: ((payload: { lockAcquire: boolean }) => void) | undefined
    }

    target.__x_sqlite_lockAcquire = lockAcquire

    if (typeof target.__x_sqlite_lockAcquireChange === "function") {
      try {
        target.__x_sqlite_lockAcquireChange({ lockAcquire })
      } catch {}
    }
  })

const invalidateTables = (reactivity: Reactivity.Reactivity.Service, tables: ReadonlyArray<string>) =>
  tables.length === 0
    ? Effect.void
    : reactivity.invalidate(Object.fromEntries(tables.map((table) => [table, [] satisfies ReadonlyArray<string>])))

const makeRuntimeEventHandler = (reactivity: Reactivity.Reactivity.Service): SqliteRuntimeEventHandler =>
  Match.type<SqliteSchema.SqliteUpdateEvent>().pipe(
    Match.tag("SqliteUpdateHookEvent", ({ table, rowid }) => reactivity.invalidate({ [table]: [rowid] })),
    Match.tag("SqliteInvalidateTablesEvent", ({ tables }) => invalidateTables(reactivity, tables)),
    Match.tag("SqliteLockChangeHookEvent", ({ lockAcquire }) =>
      Effect.zipRight(Effect.logTrace(`sqlite lock changed: ${lockAcquire}`), publishLockAcquireDebugState(lockAcquire))
    ),
    Match.exhaustive
  )

const startWorkerRuntimeEventBridge = (
  workerPool: Pool.WorkerPoolEvent,
  handleRuntimeEvent: SqliteRuntimeEventHandler
) =>
  pipe(
    workerPool.execute(new SqliteSchema.SqliteStreamEvent()),
    Stream.mapEffect((event) => Effect.uninterruptible(handleRuntimeEvent(event))),
    Stream.runDrain,
    Effect.interruptible,
    Effect.provide(RuntimeFlags.disableRuntimeMetrics),
    Effect.forkScoped
  )

const installDefaultSqlClient = (sqlClient: Internal.SqlClient) =>
  FiberRef.update(DefaultServices.currentServices, (context) => Context.add(context, Internal.SqlClient, sqlClient))

const makeInternalClientLayer = (options?: Omit<Internal.SqliteClientConfig, "relay"> | undefined) =>
  Layer.unwrapEffect(Effect.map(RelayClient, (relay) => Internal.layer({ ...options, relay })))

const make = Effect.fn(LOG_SPAN)(function* () {
  const workerPool = yield* Pool.WorkerPool
  const reactivity = yield* Reactivity.Reactivity
  const sqlClient = yield* Internal.SqlClient

  yield* Effect.logTrace("start sqlite stream event listener")

  const relay = yield* RelayClient
  yield* relay.configureWorkerTransport(workerPool)

  yield* startWorkerRuntimeEventBridge(workerPool, makeRuntimeEventHandler(reactivity))

  yield* installDefaultSqlClient(sqlClient)
})

export const layer = (options?: Omit<Internal.SqliteClientConfig, "relay"> | undefined) =>
  pipe(
    Layer.scopedDiscard(make()),
    Layer.provideMerge(makeInternalClientLayer(options)),
    Layer.provide(RelayClient.Default)
  )

export const layerConfig = (
  options: Config.Config.Wrap<Omit<Internal.SqliteClientConfig, "relay">> = Config.succeed({})
) =>
  pipe(
    Layer.scopedDiscard(make()),
    Layer.provideMerge(Layer.unwrapEffect(Effect.map(Config.unwrap(options), makeInternalClientLayer))),
    Layer.provide(RelayClient.Default)
  )

const SqliteConfig = Config.all({
  SQLITE_CAMEL: Config.boolean("CAMEL").pipe(
    Config.nested("DB"),
    Config.withDefault(true),
    Config.orElse(() => Config.succeed(true))
  )
})

export const SqliteLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const { SQLITE_CAMEL } = yield* SqliteConfig

    return layer(
      SQLITE_CAMEL
        ? {
            transformQueryNames: String.camelToSnake,
            transformResultNames: String.snakeToCamel
          }
        : {}
    )
  })
)
