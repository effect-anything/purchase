import type { SerializedWorkerPool } from "@effect/platform/Worker"
import type { WorkerError } from "@effect/platform/WorkerError"
import type { ParseError } from "effect/ParseResult"

import { SqlError } from "@effect/sql/SqlError"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Ref from "effect/Ref"
import * as Stream from "effect/Stream"
import * as SqliteMetrics from "./metrics.ts"
import * as SqliteSchema from "./schema.ts"

const LOG_SPAN = "@sql-client"

const getQueryType = (sql: string) => {
  const queryType = sql.trim().split(" ")[0].toUpperCase()

  const transactionTypes = ["BEGIN", "COMMIT", "ROLLBACK"]
  if (transactionTypes.includes(queryType)) {
    return "TRANSACTION"
  }

  return queryType
}

const measureQuery =
  (sql: string) =>
  <T>(effect: Effect.Effect<T, SqlError>) =>
    Effect.gen(function* () {
      const [a, b] = yield* Effect.timed(effect).pipe(
        Effect.tapError(() => SqliteMetrics.errorCount(Effect.succeed(1))),
        Effect.ensuring(
          Effect.all(
            [SqliteMetrics.queryCount(Effect.succeed(1)), SqliteMetrics.queryTypes(Effect.succeed(getQueryType(sql)))],
            { discard: true, concurrency: "unbounded" }
          )
        )
      )

      const latency = Duration.toMillis(a)
      yield* Effect.all(
        [SqliteMetrics.queryLatency(Effect.succeed(latency)), SqliteMetrics.lastQueryLatency(Effect.succeed(latency))],
        { concurrency: "unbounded", discard: true }
      )

      return b
    })

interface RelayTransport {
  readonly run: (
    execute: SqliteSchema.SqliteQueryExecute
  ) => Effect.Effect<SqliteSchema.QueryResult, SqlError | ParseError | WorkerError>
  readonly runStream: (
    execute: SqliteSchema.SqliteQueryStreamExecute
  ) => Stream.Stream<Array<any>, SqlError | ParseError | WorkerError>
  readonly export: Effect.Effect<Uint8Array<ArrayBufferLike>, SqlError | ParseError | WorkerError>
  readonly import: (data: Uint8Array<ArrayBufferLike>) => Effect.Effect<void, SqlError | ParseError | WorkerError>
}

type RelayTransportState =
  | { readonly _tag: "Uninitialized" }
  | {
      readonly _tag: "Worker"
      readonly transport: RelayTransport
    }

const relayNotConfiguredError = (operation: string) =>
  new SqlError({
    message: `sqlite relay transport is not configured for ${operation}`
  })

const normalizeTransportError = (
  error: SqlError | ParseError | WorkerError | unknown,
  fallbackMessage = "relay transport error"
): SqlError => {
  if (error && typeof error === "object" && "_tag" in error) {
    switch ((error as { _tag: unknown })._tag) {
      case "SqlError":
        return error as SqlError
      case "ParseError":
        return new SqlError({ message: "parse error", cause: error })
      case "WorkerError":
        return new SqlError({ message: "worker error", cause: error })
    }
  }

  return new SqlError({ message: fallbackMessage, cause: error as any })
}

const makeRelayClient = Effect.gen(function* () {
  const stateRef = yield* Ref.make<RelayTransportState>({ _tag: "Uninitialized" })

  const catchError = <A, R>(
    effect: Effect.Effect<A, SqlError | ParseError | WorkerError, R>,
    fallbackMessage?: string
  ) => Effect.mapError(effect, (error) => normalizeTransportError(error, fallbackMessage))

  const getTransport = (operation: string) =>
    Ref.get(stateRef).pipe(
      Effect.flatMap((state) =>
        state._tag === "Worker" ? Effect.succeed(state.transport) : Effect.fail(relayNotConfiguredError(operation))
      )
    )

  const run: (execute: SqliteSchema.SqliteQueryExecute) => Effect.Effect<SqliteSchema.QueryResult, SqlError> = (
    execute
  ) =>
    getTransport("query").pipe(
      Effect.flatMap((transport) => transport.run(execute)),
      (effect) => catchError(effect, "query error")
    )

  const runStream: (execute: SqliteSchema.SqliteQueryStreamExecute) => Stream.Stream<Array<any>, SqlError> = (
    execute
  ) =>
    Stream.unwrap(getTransport("stream query").pipe(Effect.map((transport) => transport.runStream(execute)))).pipe(
      Stream.mapError((error) => normalizeTransportError(error, "stream query error"))
    )

  const export_: Effect.Effect<Uint8Array<ArrayBufferLike>, SqlError> = getTransport("export").pipe(
    Effect.flatMap((transport) => transport.export),
    (effect) => catchError(effect, "export error")
  )

  const import_: (data: Uint8Array<ArrayBufferLike>) => Effect.Effect<void, SqlError> = (data) =>
    getTransport("import").pipe(
      Effect.flatMap((transport) => transport.import(data)),
      (effect) => catchError(effect, "import error")
    )

  const configureWorkerTransport = Effect.fn("configureWorkerTransport")(function* (
    workerPool: SerializedWorkerPool<SqliteSchema.SqliteEvent>
  ) {
    const transport: RelayTransport = {
      run: (execute) =>
        pipe(
          workerPool.executeEffect(execute) as ReturnType<typeof run>,
          Effect.tapErrorCause((cause) => Effect.logTrace("query failure", cause)),
          Effect.annotateLogs({ ...execute }),
          measureQuery(execute.sql),
          Effect.withLogSpan(LOG_SPAN)
        ),
      runStream: (execute) =>
        pipe(
          workerPool.execute(
            new SqliteSchema.SqliteQueryStreamExecute(
              { sql: execute.sql, params: execute.params },
              { disableValidation: true }
            )
          ) as ReturnType<typeof runStream>,
          Stream.onError((cause) =>
            Effect.logTrace("stream query failure", cause).pipe(
              Effect.annotateLogs({ ...execute }),
              Effect.withLogSpan(LOG_SPAN)
            )
          )
        ),
      export: Effect.suspend(() =>
        pipe(
          workerPool.executeEffect(new SqliteSchema.SqliteExportExecute()) as typeof export_,
          Effect.tapErrorCause((cause) => Effect.logTrace("export failure", cause)),
          Effect.withLogSpan(LOG_SPAN)
        )
      ),
      import: (data) =>
        pipe(
          workerPool.executeEffect(
            new SqliteSchema.SqliteImportExecute({ data }, { disableValidation: true })
          ) as ReturnType<typeof import_>,
          Effect.tapErrorCause((cause) => Effect.logTrace("import failure", cause)),
          Effect.withLogSpan(LOG_SPAN)
        )
    }

    yield* Ref.set(stateRef, {
      _tag: "Worker",
      transport
    })
  })

  return {
    configureWorkerTransport,
    status: Ref.get(stateRef).pipe(Effect.map((state) => state._tag)),

    run,
    runStream,
    export: export_,
    import: import_
  }
})

export class RelayClient extends Effect.Tag("@effect-x/sql-sqlite/relay-client")<
  RelayClient,
  Effect.Effect.Success<typeof makeRelayClient>
>() {
  static Default = Layer.scoped(this, makeRelayClient)
}
