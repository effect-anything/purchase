import type { Connection } from "@effect/sql/SqlConnection"

import * as Reactivity from "@effect/experimental/Reactivity"
import * as Client from "@effect/sql/SqlClient"
import { SqlError } from "@effect/sql/SqlError"
import * as Statement from "@effect/sql/Statement"
import { ATTR_DB_SYSTEM, DB_SYSTEM_VALUE_SQLITE } from "@opentelemetry/semantic-conventions/incubating"
import * as Chunk from "effect/Chunk"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import { identity, pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Scope from "effect/Scope"
import * as Stream from "effect/Stream"

export const TypeId: unique symbol = Symbol.for("@effect-x/sql-sqlite/sqlite-client-worker")
export type TypeId = typeof TypeId

export interface SqlClient extends Client.SqlClient {
  readonly [TypeId]: TypeId
  readonly config: SqliteClientConfig
  readonly export: Effect.Effect<Uint8Array, SqlError>
  readonly import: (data: Uint8Array<ArrayBufferLike>) => Effect.Effect<void, SqlError>
  readonly runStream: (sql: string, params: ReadonlyArray<unknown>) => Stream.Stream<Record<string, any>, SqlError>
  readonly updateValues: never
}

export const SqlClient = Context.GenericTag<SqlClient>("@effect-x/sql-sqlite/sqlite-client-worker")

export interface SqliteClientFactory {
  readonly run: (
    sql: string,
    params: ReadonlyArray<unknown>,
    rowMode?: "object" | "array"
  ) => Effect.Effect<ReadonlyArray<any>, SqlError, never>
  readonly runStream: (sql: string, params: ReadonlyArray<unknown>) => Stream.Stream<Record<string, any>, SqlError>
  readonly export: Effect.Effect<Uint8Array, SqlError>
  readonly import: (data: Uint8Array<ArrayBufferLike>) => Effect.Effect<void, SqlError>
  readonly getUsedSize: Effect.Effect<number, SqlError, never>
}

export type SqliteClientConfig = {
  readonly sqlite3Api: SqliteClientFactory
  readonly spanAttributes?: Record<string, unknown>
  readonly transformResultNames?: (str: string) => string
  readonly transformQueryNames?: (str: string) => string
}

interface SqliteConnection extends Connection {
  readonly export: Effect.Effect<Uint8Array, SqlError>
  readonly import: (data: Uint8Array<ArrayBufferLike>) => Effect.Effect<void, SqlError>
}

const makeTransformRows = (transformResultNames: SqliteClientConfig["transformResultNames"]) =>
  transformResultNames ? Statement.defaultTransforms(transformResultNames).array : undefined

const makeSpanAttributes = (spanAttributes: SqliteClientConfig["spanAttributes"]) => [
  ...(spanAttributes ? Object.entries(spanAttributes) : []),
  [ATTR_DB_SYSTEM, DB_SYSTEM_VALUE_SQLITE] as const
]

const wrapUnknownSqlError =
  (message: string) =>
  <E>(error: E): E | SqlError => {
    if (error && typeof error === "object" && "_tag" in error) {
      return error
    }

    return new SqlError({ message, cause: error })
  }

const makeConnection = ({
  api,
  run
}: {
  readonly api: SqliteClientFactory
  readonly run: SqliteClientFactory["run"]
}): SqliteConnection =>
  identity<SqliteConnection>({
    execute(sql, params, rowTransform) {
      return rowTransform ? Effect.map(run(sql, params), rowTransform) : run(sql, params)
    },
    executeRaw(sql, params) {
      return run(sql, params)
    },
    executeValues(sql, params) {
      return run(sql, params, "array")
    },
    executeUnprepared(sql, params, rowTransform) {
      return this.execute(sql, params, rowTransform)
    },
    executeStream(sql, params, rowTransform) {
      return pipe(
        api.runStream(sql, params),
        rowTransform
          ? Stream.mapChunks((chunk) => Chunk.unsafeFromArray(rowTransform(Chunk.toReadonlyArray(chunk))))
          : identity,
        Stream.mapError(wrapUnknownSqlError("query stream execute error"))
      )
    },
    export: api.export,
    import: api.import
  })

export const make = (options: SqliteClientConfig): Effect.Effect<SqlClient, SqlError, Reactivity.Reactivity> =>
  Effect.gen(function* () {
    const reactivity = yield* Reactivity.Reactivity
    const compiler = Statement.makeCompilerSqlite(options.transformQueryNames)
    const transformRows = makeTransformRows(options.transformResultNames)
    const api = options.sqlite3Api
    const run = api.run

    const semaphore = yield* Effect.makeSemaphore(1)
    const connection = makeConnection({
      api,
      run
    })
    const serializeEffect = <A, E, R>(effect: Effect.Effect<A, E, R>) => semaphore.withPermits(1)(effect)
    const serializeStream = <A, E, R>(stream: Stream.Stream<A, E, R>) =>
      Stream.unwrapScoped(Effect.acquireRelease(semaphore.take(1), () => semaphore.release(1)).pipe(Effect.as(stream)))

    const acquirer = serializeEffect(Effect.succeed(connection))
    const transactionAcquirer = Effect.uninterruptibleMask((restore) =>
      Effect.as(
        Effect.zipRight(
          restore(semaphore.take(1)),
          Effect.tap(Effect.scope, (scope) => Scope.addFinalizer(scope, semaphore.release(1)))
        ),
        connection
      )
    )

    return Object.assign(
      (yield* Client.make({
        acquirer,
        compiler,
        transactionAcquirer,
        spanAttributes: makeSpanAttributes(options.spanAttributes),
        transformRows
      })) as SqlClient,
      {
        [TypeId]: TypeId as TypeId,
        config: options,
        reactive: reactivity.stream,
        reactiveMailbox: reactivity.query,
        export: serializeEffect(connection.export),
        import: (data: Uint8Array<ArrayBufferLike>) => serializeEffect(connection.import(data)),
        runStream: (sql: string, params: ReadonlyArray<unknown>) => serializeStream(api.runStream(sql, params))
      }
    )
  })

export const layer = (config: SqliteClientConfig): Layer.Layer<Client.SqlClient, SqlError, Reactivity.Reactivity> =>
  Layer.effectContext(
    Effect.map(make(config), (client) => Context.make(SqlClient, client).pipe(Context.add(Client.SqlClient, client)))
  )
