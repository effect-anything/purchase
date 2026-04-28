import type { SchemaBroadcastChannel } from "./internal/broadcast-channel.ts"
import type { SqliteClientFactory } from "./internal/worker.ts"

import * as WaSqlite from "@effect-x/wa-sqlite"
import SQLiteESMFactory from "@effect-x/wa-sqlite/dist/wa-sqlite.mjs"
// @ts-ignore
import { AccessHandlePoolVFS } from "@effect-x/wa-sqlite/src/examples/AccessHandlePoolVFS.js"
import { SqlError } from "@effect/sql/SqlError"
import * as Data from "effect/Data"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import { pipe } from "effect/Function"
import * as Option from "effect/Option"
import * as Runtime from "effect/Runtime"
import * as Schedule from "effect/Schedule"
import * as Stream from "effect/Stream"
import {
  SqliteBroadcastUpdates,
  SqliteExportExecute,
  SqliteImportExecute,
  SqliteInvalidateTablesEvent,
  type SqliteParams,
  SqliteQueryExecute,
  SqliteQueryStreamClose,
  SqliteQueryStreamNext,
  SqliteQueryStreamOpen,
  type SqliteRowMode,
  SqliteStorageSize,
  type SqliteUpdateEvent,
  SqliteUpdateHookEvent,
  SqliteWorkerReadyEvent,
  type WorkerError
} from "./schema.ts"

import { runSqliteDebugLog, sqliteDebugLog } from "./internal/debug-log.ts"

export type OnUpdate = (event: SqliteUpdateEvent) => Effect.Effect<void>

export interface RelayDebugContext {
  readonly channelName?: string
  readonly dbName: string
  readonly role: "client" | "main"
  readonly workerId: string
}

type AccessHandlePoolVfsInstance = {
  close: (options?: { cleanup: string } | undefined) => void
  getUsedSize: () => number
}

type AccessHandlePoolVfsModule = {
  create: (
    name: string,
    factory: Awaited<ReturnType<typeof SQLiteESMFactory>>,
    options?: {
      logger?: ((entry: { details?: unknown; event: string; level: string }) => void) | undefined
    }
  ) => Promise<AccessHandlePoolVfsInstance>
}

const AccessHandlePoolVfs = AccessHandlePoolVFS as unknown as AccessHandlePoolVfsModule

const withRelayDebug = (debug: RelayDebugContext | undefined, details?: Record<string, unknown>) => ({
  ...debug,
  ...details
})

const makeVfsLogAnnotations = (debug: RelayDebugContext | undefined, details: unknown, level: string) => {
  const normalizedDetails =
    details && typeof details === "object" && !Array.isArray(details)
      ? (details as Record<string, unknown>)
      : details === undefined
        ? {}
        : { details }

  return withRelayDebug(debug, {
    ...normalizedDetails,
    vfsLevel: level
  })
}

const makeAccessHandlePoolVfsLogger = (debug: RelayDebugContext | undefined) =>
  debug === undefined
    ? undefined
    : (entry: { details?: unknown; event: string; level: string }) => {
        Effect.runSync(
          sqliteDebugLog("sqlite-vfs", entry.event, makeVfsLogAnnotations(debug, entry.details, entry.level), {
            level: entry.level === "debug" ? "Debug" : "Info",
            logSpan: "sqlite-relay.sqlite"
          }).pipe(Effect.withTracerEnabled(false))
        )
      }

const toRelaySqlError = (error: SqlError | WorkerError | unknown, message = "relay message error"): SqlError => {
  if (error && typeof error === "object" && "_tag" in error) {
    switch ((error as { _tag: unknown })._tag) {
      case "SqlError":
        return error as SqlError
      case "WorkerError":
        return new SqlError({ message: "worker error", cause: error })
    }
  }

  return new SqlError({ message, cause: error as any })
}

const mapRelayError = <A, R>(effect: Effect.Effect<A, unknown, R>) =>
  Effect.mapError(effect, (error) => toRelaySqlError(error))

const makeObjectRow = (columns: ReadonlyArray<string>, row: ReadonlyArray<unknown>) => {
  const objectRow: Record<string, any> = {}

  for (let i = 0; i < columns.length; i++) {
    objectRow[columns[i]] = row[i]
  }

  return objectRow
}

const RELAY_UPDATE_IGNORE_TABLES = [
  "sqlite_master",
  "sqlite_sequence",
  "sql_migrations",
  "event_remotes",
  "event_journal"
] as const

const RELAY_STREAM_CHUNK_SIZE = 64
const RELAY_STREAM_IDLE_TIMEOUT_MS = 30_000
const RELAY_REQUEST_TIMEOUT_MS = 30_000
const SQLITE_DESERIALIZE_FREEONCLOSE = 1
const SQLITE_DESERIALIZE_RESIZEABLE = 2

const shouldInvalidateTable = (table: string) =>
  !table.startsWith("sqlite_") &&
  !RELAY_UPDATE_IGNORE_TABLES.includes(table as (typeof RELAY_UPDATE_IGNORE_TABLES)[number])

interface RelayStreamChunk {
  readonly rows: Array<Record<string, any>>
  readonly done: boolean
  readonly streamId?: string | undefined
}

type RelayStreamState = {
  readonly rows: ReadonlyArray<Record<string, any>>
  readonly index: number
  readonly done: boolean
  readonly streamId?: string | undefined
}

interface RelayStreamSession {
  readonly iterator: Iterator<Record<string, any>>
  readonly timeoutId: ReturnType<typeof setTimeout>
  readonly release: Effect.Effect<number>
}

type BroadcastRuntimeEvent = Extract<
  SqliteUpdateEvent,
  { readonly _tag: "SqliteUpdateHookEvent" | "SqliteInvalidateTablesEvent" }
>

export class RelayStatusError extends Data.TaggedError("@effect-x/sql-sqlite/relay-status-error")<{
  readonly state: "alive" | "unknown"
  readonly cause?: Error | undefined
}> {}

export const runRelayClient = Effect.fn(
  function* ({
    channel,
    debug,
    onUpdate
  }: {
    channel: SchemaBroadcastChannel
    debug?: RelayDebugContext | undefined
    onUpdate: OnUpdate
  }) {
    yield* sqliteDebugLog("sqlite-relay", "client:init:start", withRelayDebug(debug), {
      logSpan: "sqlite-relay.client",
      spanName: "sqlite-relay.client.init"
    })

    channel.handle(SqliteBroadcastUpdates, ({ event }) => Effect.as(onUpdate(event), "ok"))

    const catchRelayRequest = <A, R>(effect: Effect.Effect<A, unknown, R>) => mapRelayError(effect)

    const sendRequest = <A extends Parameters<typeof channel.send>[0]>(message: A) =>
      channel.send(message, {
        discard: false,
        ignoreUnhandled: true,
        timeoutMs: RELAY_REQUEST_TIMEOUT_MS
      })

    const run = (sql: string, params: ReadonlyArray<unknown>, rowMode: SqliteRowMode = "object") =>
      catchRelayRequest(
        sendRequest(
          new SqliteQueryExecute({ sql, params: params as SqliteParams, rowMode }, { disableValidation: true })
        )
      )

    const runStream: SqliteClientFactory["runStream"] = (sql, params) =>
      Stream.unwrapScoped(
        Effect.acquireRelease(
          catchRelayRequest(
            sendRequest(new SqliteQueryStreamOpen({ sql, params: params as SqliteParams }, { disableValidation: true }))
          ),
          ({ streamId }) =>
            streamId
              ? Effect.ignore(
                  channel.send(new SqliteQueryStreamClose({ streamId }, { disableValidation: true }), {
                    discard: true,
                    ignoreUnhandled: true
                  })
                )
              : Effect.void
        ).pipe(
          Effect.map((opened) => {
            const nextState = (
              state: RelayStreamState
            ): Effect.Effect<Option.Option<readonly [Record<string, any>, RelayStreamState]>, SqlError> => {
              if (state.index < state.rows.length) {
                return Effect.succeed(
                  Option.some([
                    state.rows[state.index]!,
                    {
                      ...state,
                      index: state.index + 1
                    }
                  ] as const)
                )
              }

              if (state.done || !state.streamId) {
                return Effect.succeed(Option.none())
              }

              return catchRelayRequest(
                sendRequest(new SqliteQueryStreamNext({ streamId: state.streamId }, { disableValidation: true }))
              ).pipe(
                Effect.flatMap((chunk) =>
                  nextState({
                    rows: chunk.rows,
                    index: 0,
                    done: chunk.done,
                    streamId: chunk.done ? undefined : state.streamId
                  })
                )
              )
            }

            return Stream.unfoldEffect(
              {
                rows: opened.rows,
                index: 0,
                done: opened.done,
                streamId: opened.streamId
              },
              nextState
            )
          })
        )
      )

    const export_ = catchRelayRequest(sendRequest(new SqliteExportExecute()))

    const import_ = (data: Uint8Array<ArrayBufferLike>) =>
      catchRelayRequest(sendRequest(new SqliteImportExecute({ data }, { disableValidation: true })))

    const getUsedSize = catchRelayRequest(sendRequest(new SqliteStorageSize()))

    const clientFactory = {
      run,
      runStream,
      export: export_,
      import: import_,
      getUsedSize
    } satisfies SqliteClientFactory

    yield* sqliteDebugLog("sqlite-relay", "client:init:ready", withRelayDebug(debug), {
      logSpan: "sqlite-relay.client"
    })

    return clientFactory
  },
  Effect.withLogSpan("sqlite-relay.client"),
  Effect.withSpan("relay-client.init")
)

export const handleRelayServer = Effect.fn(
  function* ({
    channel,
    sqlite3,
    db,
    debug,
    onUpdate,
    hasReady
  }: {
    channel: SchemaBroadcastChannel
    sqlite3: SQLiteAPI
    db: number
    debug?: RelayDebugContext | undefined
    onUpdate: OnUpdate
    hasReady: () => boolean
  }) {
    yield* sqliteDebugLog("sqlite-relay", "server:init:start", withRelayDebug(debug), {
      logSpan: "sqlite-relay.server",
      spanName: "sqlite-relay.server.init"
    })

    let nextStreamId = 0
    const streamSessions = new Map<string, RelayStreamSession>()

    const semaphore = yield* Effect.makeSemaphore(1)

    const serializeEffect = <A, E, R>(effect: Effect.Effect<A, E, R>) => semaphore.withPermits(1)(effect)

    const serializeStream = <A, E, R>(stream: Stream.Stream<A, E, R>) =>
      Stream.unwrapScoped(Effect.acquireRelease(semaphore.take(1), () => semaphore.release(1)).pipe(Effect.as(stream)))

    const runtime = yield* Effect.runtime<never>()
    const runExit = Runtime.runPromiseExit(runtime)

    const armStreamTimeout = (streamId: string) =>
      setTimeout(() => {
        runExit(closeStreamSession(streamId).pipe(Effect.catchAllCause(Effect.logError)))
      }, RELAY_STREAM_IDLE_TIMEOUT_MS)

    const closeStreamSession = Effect.fnUntraced(function* (streamId: string) {
      const session = streamSessions.get(streamId)
      streamSessions.delete(streamId)
      if (!session) return

      yield* Effect.sync(() => {
        clearTimeout(session.timeoutId)
        session.iterator.return?.()
      })
      yield* Effect.ignore(session.release)
    })

    yield* Effect.addFinalizer(() =>
      Effect.forEach(Array.from(streamSessions.keys()), closeStreamSession, {
        discard: true,
        concurrency: "unbounded"
      })
    )

    const rawRun: (
      sql: string,
      params: ReadonlyArray<unknown>,
      rowMode?: SqliteRowMode | undefined
    ) => Effect.Effect<ReadonlyArray<any>, SqlError, never> = (sql, params, rowMode = "object") =>
      Effect.try({
        try: () => {
          const results: Array<any> = []
          for (const stmt of sqlite3.statements(db, sql)) {
            let columns: Array<string> | undefined
            sqlite3.bind_collection(stmt, params as any)
            while (sqlite3.step(stmt) === WaSqlite.SQLITE_ROW) {
              columns = columns ?? sqlite3.column_names(stmt)
              const row = sqlite3.row(stmt)
              results.push(rowMode === "object" ? makeObjectRow(columns, row) : row)
            }
          }
          return results
        },
        catch: (cause) => new SqlError({ cause, message: "Failed to execute statement" })
      })

    const run: (
      sql: string,
      params: ReadonlyArray<unknown>,
      rowMode?: SqliteRowMode | undefined
    ) => Effect.Effect<ReadonlyArray<any>, SqlError, never> = (sql, params, rowMode = "object") =>
      serializeEffect(rawRun(sql, params, rowMode))

    const rawRunStream: (
      sql: string,
      params: ReadonlyArray<unknown>
    ) => Stream.Stream<Record<string, any>, SqlError, never> = (sql, params) => {
      function* streamRows() {
        for (const stmt of sqlite3.statements(db, sql)) {
          let columns: Array<string> | undefined
          sqlite3.bind_collection(stmt, params as any)
          while (sqlite3.step(stmt) === WaSqlite.SQLITE_ROW) {
            columns = columns ?? sqlite3.column_names(stmt)
            const row = sqlite3.row(stmt)
            yield makeObjectRow(columns, row)
          }
        }
      }

      return Stream.suspend(() => Stream.fromIteratorSucceed(streamRows()[Symbol.iterator]())).pipe(
        Stream.mapError((cause) => new SqlError({ cause, message: "Failed to execute statement" }))
      )
    }

    const runStream: (
      sql: string,
      params: ReadonlyArray<unknown>
    ) => Stream.Stream<Record<string, any>, SqlError, never> = (sql, params) =>
      serializeStream(rawRunStream(sql, params))

    const createStreamIterator = (sql: string, params: ReadonlyArray<unknown>) =>
      (function* () {
        for (const stmt of sqlite3.statements(db, sql)) {
          let columns: Array<string> | undefined
          sqlite3.bind_collection(stmt, params as any)
          while (sqlite3.step(stmt) === WaSqlite.SQLITE_ROW) {
            columns = columns ?? sqlite3.column_names(stmt)
            yield makeObjectRow(columns, sqlite3.row(stmt))
          }
        }
      })()

    const listTrackedTables = rawRun(
      "SELECT name FROM sqlite_master WHERE type IN ('table', 'view')",
      [],
      "object"
    ).pipe(
      Effect.map((rows) =>
        Array.from(
          new Set(
            rows
              .map((row) => row?.name)
              .filter((table): table is string => typeof table === "string" && shouldInvalidateTable(table))
          )
        )
      )
    )

    const broadcastRuntimeEvent = (event: BroadcastRuntimeEvent) =>
      Effect.all(
        [
          onUpdate(event),
          Effect.ignore(
            channel.send(new SqliteBroadcastUpdates({ event }, { disableValidation: true }), {
              discard: true
            })
          )
        ],
        {
          discard: true,
          concurrency: "unbounded"
        }
      )

    const broadcastInvalidateTables = (tables: ReadonlyArray<string>) =>
      tables.length === 0
        ? Effect.void
        : broadcastRuntimeEvent(
            new SqliteInvalidateTablesEvent(
              {
                db: "main",
                tables: Array.from(tables)
              },
              { disableValidation: true }
            )
          )

    const readStreamChunk = (
      iterator: Iterator<Record<string, any>>,
      message: string
    ): Effect.Effect<RelayStreamChunk, SqlError, never> =>
      Effect.try({
        try: () => {
          const rows: Array<Record<string, any>> = []

          for (let index = 0; index < RELAY_STREAM_CHUNK_SIZE; index++) {
            const next = iterator.next()
            if (next.done) {
              return { rows, done: true }
            }

            rows.push(next.value)
          }

          return { rows, done: false }
        },
        catch: (cause) => new SqlError({ cause, message })
      })

    const openQueryStream = Effect.fnUntraced(function* (sql: string, params: ReadonlyArray<unknown>) {
      yield* semaphore.take(1)

      const release = semaphore.release(1)

      const iteratorExit = yield* Effect.exit(
        Effect.try({
          try: () => createStreamIterator(sql, params),
          catch: (cause) => new SqlError({ cause, message: "Failed to open relay stream" })
        })
      )

      if (Exit.isFailure(iteratorExit)) {
        yield* Effect.ignore(release)
        return yield* Effect.failCause(iteratorExit.cause)
      }

      const iterator = iteratorExit.value
      const streamId = `stream-${nextStreamId++}`
      const chunkExit = yield* Effect.exit(readStreamChunk(iterator, "Failed to read relay stream chunk"))

      if (Exit.isFailure(chunkExit)) {
        yield* Effect.sync(() => iterator.return?.())
        yield* Effect.ignore(release)
        return yield* Effect.failCause(chunkExit.cause)
      }

      const chunk = chunkExit.value

      if (chunk.done) {
        yield* Effect.sync(() => iterator.return?.())
        yield* Effect.ignore(release)
        return {
          rows: chunk.rows,
          done: true
        } as const
      }

      yield* Effect.sync(() => {
        streamSessions.set(streamId, {
          iterator,
          release,
          timeoutId: armStreamTimeout(streamId)
        })
      })

      return {
        streamId,
        rows: chunk.rows,
        done: false
      } as const
    })

    const nextQueryStream = (streamId: string) =>
      Effect.sync(() => Option.fromNullable(streamSessions.get(streamId))).pipe(
        Effect.flatMap(
          Option.match({
            onNone: () =>
              Effect.fail(
                new SqlError({
                  message: `Relay stream ${streamId} not found`
                })
              ),
            onSome: (session) =>
              Effect.sync(() => {
                clearTimeout(session.timeoutId)

                const refreshed = {
                  iterator: session.iterator,
                  release: session.release,
                  timeoutId: armStreamTimeout(streamId)
                } satisfies RelayStreamSession

                streamSessions.set(streamId, refreshed)
                return refreshed.iterator
              })
          })
        ),
        Effect.flatMap((iterator) =>
          readStreamChunk(iterator, `Failed to read relay stream chunk for ${streamId}`).pipe(
            Effect.tap((chunk) => (chunk.done ? closeStreamSession(streamId) : Effect.void)),
            Effect.map((chunk) =>
              chunk.done
                ? ({
                    rows: chunk.rows,
                    done: true
                  } satisfies RelayStreamChunk)
                : ({
                    streamId,
                    rows: chunk.rows,
                    done: false
                  } satisfies RelayStreamChunk)
            ),
            Effect.tapError(() => closeStreamSession(streamId))
          )
        )
      )

    const export_: Effect.Effect<Uint8Array<ArrayBufferLike>, SqlError, never> = serializeEffect(
      Effect.try({
        try: () => sqlite3.serialize(db, "main"),
        catch: (cause) => new SqlError({ cause, message: "Failed to export database" })
      })
    )

    const import_: (data: Uint8Array<ArrayBufferLike>) => Effect.Effect<void, SqlError, never> = (data) =>
      serializeEffect(
        Effect.gen(function* () {
          const tablesBefore = yield* Effect.catchAll(listTrackedTables, () => Effect.succeed([] as Array<string>))

          yield* Effect.acquireUseRelease(
            Effect.try({
              try: () => sqlite3.open_v2(":memory:"),
              catch: (cause) => new SqlError({ cause, message: "Failed to open temporary import database" })
            }),
            (temporaryDb) =>
              Effect.gen(function* () {
                yield* Effect.try({
                  try: () =>
                    sqlite3.deserialize(
                      temporaryDb,
                      "main",
                      data,
                      data.length,
                      data.length,
                      SQLITE_DESERIALIZE_FREEONCLOSE | SQLITE_DESERIALIZE_RESIZEABLE
                    ),
                  catch: (cause) =>
                    new SqlError({
                      cause,
                      message: "Failed to deserialize imported database snapshot"
                    })
                })

                yield* Effect.try({
                  try: () => sqlite3.backup(db, "main", temporaryDb, "main"),
                  catch: (cause) =>
                    new SqlError({
                      cause,
                      message: "Failed to copy imported database into OPFS database"
                    })
                })
              }),
            (temporaryDb) =>
              Effect.ignore(
                Effect.try({
                  try: () => sqlite3.close(temporaryDb),
                  catch: (cause) => new SqlError({ cause, message: "Failed to close temporary import database" })
                })
              )
          )

          const tablesAfter = yield* Effect.catchAll(listTrackedTables, () => Effect.succeed([] as Array<string>))

          yield* broadcastInvalidateTables(Array.from(new Set([...tablesBefore, ...tablesAfter])))
        })
      )

    // @ts-ignore
    const getUsedSize = serializeEffect(Effect.sync(() => sqlite3._getUsedSize() as number))

    channel.handle(SqliteQueryExecute, ({ sql, params, rowMode }) =>
      Effect.withTracerEnabled(run(sql, params, rowMode), false)
    )
    channel.handle(SqliteQueryStreamOpen, ({ sql, params }) =>
      Effect.withTracerEnabled(openQueryStream(sql, params), false)
    )
    channel.handle(SqliteQueryStreamNext, ({ streamId }) => Effect.withTracerEnabled(nextQueryStream(streamId), false))
    channel.handle(SqliteQueryStreamClose, ({ streamId }) =>
      Effect.withTracerEnabled(closeStreamSession(streamId), false)
    )
    channel.handle(SqliteImportExecute, ({ data }) => Effect.withTracerEnabled(import_(data), false))
    channel.handle(SqliteExportExecute, () => Effect.withTracerEnabled(export_, false))
    channel.handle(SqliteStorageSize, () => Effect.withTracerEnabled(getUsedSize, false))

    channel.handle(SqliteWorkerReadyEvent, () =>
      pipe(
        Effect.sync(() => ({ state: hasReady() ? "alive" : "unknown" }) as const),
        Effect.withTracerEnabled(false)
      )
    )

    sqlite3.update_hook(db, (op, databaseName, table, rowid) => {
      if (!table) return
      if (RELAY_UPDATE_IGNORE_TABLES.includes(table as (typeof RELAY_UPDATE_IGNORE_TABLES)[number])) {
        return
      }

      const event = SqliteUpdateHookEvent.make(
        {
          op,
          db: databaseName ?? "main",
          table,
          rowid: String(Number(rowid))
        },
        {
          disableValidation: true
        }
      )

      runExit(broadcastRuntimeEvent(event).pipe(Effect.catchAllCause(Effect.logError)))
    })

    const clientFactory = {
      run,
      runStream,
      export: export_,
      import: import_,
      getUsedSize
    } satisfies SqliteClientFactory

    yield* sqliteDebugLog("sqlite-relay", "server:init:ready", withRelayDebug(debug), {
      logSpan: "sqlite-relay.server"
    })
    return clientFactory
  },
  Effect.withLogSpan("sqlite-relay.server"),
  Effect.withSpan("relay-server.init")
)

export const initSqlite = Effect.fn(function* (options: {
  dbName: string
  cleanupOnClose?: boolean | undefined
  debug?: RelayDebugContext | undefined
}) {
  yield* sqliteDebugLog(
    "sqlite-relay",
    "init:start",
    withRelayDebug(options.debug, { storageDbName: options.dbName }),
    { logSpan: "sqlite-relay.sqlite", spanName: "sqlite-relay.sqlite-init" }
  )

  const factory = yield* pipe(
    Effect.tryPromise(() => SQLiteESMFactory()),
    Effect.tap(
      sqliteDebugLog(
        "sqlite-relay",
        "init:factory-ready",
        withRelayDebug(options.debug, { storageDbName: options.dbName }),
        { logSpan: "sqlite-relay.sqlite" }
      )
    ),
    Effect.withSpan("sqlite.factory")
  )

  const sqlite3 = WaSqlite.Factory(factory)

  const vfs = yield* pipe(
    Effect.tryPromise({
      try: () =>
        AccessHandlePoolVfs.create("opfs", factory, {
          logger: makeAccessHandlePoolVfsLogger(options.debug)
        }),
      catch: (cause) => new SqlError({ cause, message: "Failed to prepare sqlite vfs" })
    }),
    Effect.tap((registeredVfs) => Effect.sync(() => sqlite3.vfs_register(registeredVfs as any, true))),
    Effect.retry({
      times: 10,
      schedule: Schedule.jittered(Schedule.exponential(300, 1.5))
    }),
    Effect.tap(
      sqliteDebugLog(
        "sqlite-relay",
        "init:vfs-ready",
        withRelayDebug(options.debug, { storageDbName: options.dbName }),
        { logSpan: "sqlite-relay.sqlite" }
      )
    ),
    Effect.acquireRelease((accessHandlePoolVFS: AccessHandlePoolVfsInstance) =>
      Effect.ignore(
        sqliteDebugLog(
          "sqlite-relay",
          "init:vfs:close:start",
          withRelayDebug(options.debug, { storageDbName: options.dbName }),
          { logSpan: "sqlite-relay.sqlite" }
        ).pipe(
          Effect.flatMap(() =>
            Effect.try({
              try: () => {
                accessHandlePoolVFS.close(
                  options.cleanupOnClose
                    ? {
                        cleanup: options.dbName
                      }
                    : undefined
                )
              },
              catch: (cause) => new SqlError({ cause, message: "Failed to close sqlite vfs" })
            })
          ),
          Effect.tap(
            sqliteDebugLog(
              "sqlite-relay",
              "init:vfs:close:done",
              withRelayDebug(options.debug, { storageDbName: options.dbName }),
              { logSpan: "sqlite-relay.sqlite" }
            )
          )
        )
      )
    ),
    Effect.withSpan("sqlite.accessHandlePoolVFSOPFS")
  )

  // @ts-ignore
  if (!sqlite3._getUsedSize) {
    // @ts-ignore
    sqlite3._getUsedSize = () => {
      return vfs.getUsedSize()
    }
  }

  const db = yield* pipe(
    sqliteDebugLog(
      "sqlite-relay",
      "init:open:start",
      withRelayDebug(options.debug, { storageDbName: options.dbName }),
      { logSpan: "sqlite-relay.sqlite" }
    ),
    Effect.flatMap(() =>
      Effect.try({
        try: () => sqlite3.open_v2(options.dbName, undefined, "opfs"),
        catch: (cause) => {
          const error =
            cause instanceof Error
              ? {
                  name: cause.name,
                  message: cause.message
                }
              : { cause: String(cause) }

          runSqliteDebugLog(
            "sqlite-relay",
            "init:open:error",
            withRelayDebug(options.debug, { storageDbName: options.dbName, ...error }),
            { logSpan: "sqlite-relay.sqlite" }
          )

          return new SqlError({ cause, message: `Failed to open database: ${options.dbName}` })
        }
      })
    ),
    Effect.retry({
      times: 3,
      schedule: Schedule.intersect(
        Schedule.jittered(Schedule.exponential(200, 1.5)),
        Schedule.elapsed.pipe(Schedule.whileOutput((elapsed) => Duration.lessThan(elapsed, Duration.seconds(5))))
      )
    }),
    Effect.acquireRelease((dbNumber) =>
      Effect.ignore(
        sqliteDebugLog(
          "sqlite-relay",
          "init:db:close:start",
          withRelayDebug(options.debug, { storageDbName: options.dbName, dbNumber }),
          { logSpan: "sqlite-relay.sqlite" }
        ).pipe(
          Effect.flatMap(() =>
            Effect.try({
              try: () => sqlite3.close(dbNumber),
              catch: (cause) => new SqlError({ cause, message: "Failed to close database" })
            })
          ),
          Effect.tap(
            sqliteDebugLog(
              "sqlite-relay",
              "init:db:close:done",
              withRelayDebug(options.debug, { storageDbName: options.dbName, dbNumber }),
              { logSpan: "sqlite-relay.sqlite" }
            )
          )
        )
      )
    ),
    Effect.withSpan("sqlite.open-v2")
  )

  yield* sqliteDebugLog(
    "sqlite-relay",
    "init:open:ready",
    withRelayDebug(options.debug, { storageDbName: options.dbName }),
    { logSpan: "sqlite-relay.sqlite" }
  )

  return {
    sqlite3,
    db
  } as const
})
