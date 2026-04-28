import * as WaSqlite from "@effect-x/wa-sqlite"
import { assert, describe, expect, it } from "@effect/vitest"
import { Cause, Effect, Exit, Fiber, Stream } from "effect"

import { handleRelayServer, runRelayClient } from "../src/relay.ts"
import {
  SqliteBroadcastUpdates,
  SqliteExportExecute,
  SqliteImportExecute,
  SqliteInvalidateTablesEvent,
  SqliteQueryExecute,
  SqliteQueryStreamClose,
  SqliteQueryStreamNext,
  SqliteQueryStreamOpen,
  SqliteStorageSize,
  SqliteUpdateHookEvent,
  SqliteWorkerReadyEvent,
  WorkerError
} from "../src/schema.ts"

type HandleMap = Map<string, any>

const makeFakeChannel = () => {
  const handles: HandleMap = new Map()
  const sent: Array<{ message: any; options?: unknown }> = []
  const streamedRows = Array.from({ length: 8 }, (_, index) => ({ index }))

  return {
    handles,
    sent,
    channel: {
      handle: (schema: { _tag: string }, handler: (payload: any) => Effect.Effect<any, any>) => {
        handles.set(schema._tag, handler)
      },
      send: (message: any, options?: unknown) => {
        sent.push({ message, options })

        switch (message._tag) {
          case "SqliteQueryExecute":
            return Effect.succeed([{ sql: message.sql, rowMode: message.rowMode }])
          case "SqliteQueryStreamOpen":
            return Effect.succeed({
              streamId: "stream-1",
              rows: streamedRows.slice(0, 4),
              done: false
            })
          case "SqliteQueryStreamNext":
            return Effect.succeed({
              streamId: undefined,
              rows: streamedRows.slice(4),
              done: true
            })
          case "SqliteQueryStreamClose":
            return Effect.void
          case "SqliteExportExecute":
            return Effect.succeed(new Uint8Array([1, 2]))
          case "SqliteImportExecute":
            return Effect.void
          case "SqliteStorageSize":
            return Effect.succeed(64)
          case "SqliteBroadcastUpdates":
            return Effect.succeed("ok")
          default:
            return Effect.die(`unexpected message: ${message._tag}`)
        }
      }
    }
  }
}

describe("relay", () => {
  it.effect("runRelayClient delegates requests and forwards broadcast updates", () =>
    Effect.gen(function* () {
      const { channel, handles, sent } = makeFakeChannel()
      const updates: Array<SqliteUpdateHookEvent> = []

      const relayClient = yield* runRelayClient({
        channel: channel as any,
        onUpdate: (event) =>
          Effect.sync(() => {
            updates.push(event as SqliteUpdateHookEvent)
          })
      })

      const rows = yield* relayClient.run("SELECT 1", [], "array")
      const streamRows = yield* Stream.runCollect(relayClient.runStream("SELECT 1", []))
      const bytes = yield* relayClient.export
      yield* relayClient.import(new Uint8Array([9]))
      const usedSize = yield* relayClient.getUsedSize

      const updateHandler = handles.get(SqliteBroadcastUpdates._tag)
      assert(updateHandler)
      yield* updateHandler({
        event: SqliteUpdateHookEvent.make(
          { op: 18, db: "main", table: "users", rowid: "7" },
          { disableValidation: true }
        )
      }) as Effect.Effect<any, any>

      expect(rows).toEqual([{ sql: "SELECT 1", rowMode: "array" }])
      expect(Array.from(streamRows)).toEqual([
        { index: 0 },
        { index: 1 },
        { index: 2 },
        { index: 3 },
        { index: 4 },
        { index: 5 },
        { index: 6 },
        { index: 7 }
      ])
      expect(Array.from(bytes)).toEqual([1, 2])
      expect(usedSize).toBe(64)
      expect(sent.map((entry) => entry.message._tag)).toEqual([
        SqliteExportExecute._tag,
        SqliteStorageSize._tag,
        SqliteQueryExecute._tag,
        SqliteQueryStreamOpen._tag,
        SqliteQueryStreamNext._tag,
        SqliteQueryStreamClose._tag,
        SqliteImportExecute._tag
      ])
      expect(sent).toEqual([
        {
          message: expect.objectContaining({ _tag: SqliteExportExecute._tag }),
          options: {
            discard: false,
            ignoreUnhandled: true,
            timeoutMs: 30_000
          }
        },
        {
          message: expect.objectContaining({ _tag: SqliteStorageSize._tag }),
          options: {
            discard: false,
            ignoreUnhandled: true,
            timeoutMs: 30_000
          }
        },
        {
          message: expect.objectContaining({ _tag: SqliteQueryExecute._tag }),
          options: {
            discard: false,
            ignoreUnhandled: true,
            timeoutMs: 30_000
          }
        },
        {
          message: expect.objectContaining({ _tag: SqliteQueryStreamOpen._tag }),
          options: {
            discard: false,
            ignoreUnhandled: true,
            timeoutMs: 30_000
          }
        },
        {
          message: expect.objectContaining({ _tag: SqliteQueryStreamNext._tag }),
          options: {
            discard: false,
            ignoreUnhandled: true,
            timeoutMs: 30_000
          }
        },
        {
          message: expect.objectContaining({ _tag: SqliteQueryStreamClose._tag }),
          options: {
            discard: true,
            ignoreUnhandled: true
          }
        },
        {
          message: expect.objectContaining({ _tag: SqliteImportExecute._tag }),
          options: {
            discard: false,
            ignoreUnhandled: true,
            timeoutMs: 30_000
          }
        }
      ])
      expect(updates).toEqual([
        SqliteUpdateHookEvent.make({ op: 18, db: "main", table: "users", rowid: "7" }, { disableValidation: true })
      ])
    })
  )

  it.effect("runRelayClient normalizes worker failures into `SqlError` for stream requests", () =>
    Effect.gen(function* () {
      const relayClient = yield* runRelayClient({
        channel: {
          handle: () => {},
          send: (message: any) => {
            if (message._tag === SqliteQueryStreamOpen._tag) {
              return Effect.fail(new WorkerError({ reason: "send" }))
            }

            return Effect.die(`unexpected message: ${message._tag}`)
          }
        } as any,
        onUpdate: () => Effect.void
      })

      const streamExit = yield* Effect.exit(Stream.runCollect(relayClient.runStream("SELECT 1", [])))

      assert(Exit.isFailure(streamExit))
      assert(Cause.isFailType(streamExit.cause))
      const error = streamExit.cause.error as { _tag: string; message: string }
      expect(error._tag).toBe("SqlError")
      expect(error.message).toBe("worker error")
    })
  )

  it.scoped("handleRelayServer exposes sqlite handlers and ignores internal update-hook tables", () =>
    Effect.gen(function* () {
      const handles: HandleMap = new Map()
      const sent: Array<{ message: any; options?: unknown }> = []
      const updates: Array<SqliteUpdateHookEvent | SqliteInvalidateTablesEvent> = []
      const sqliteCalls: Array<string> = []

      let updateHook:
        | ((op: number, databaseName: string | null, table: string | null, rowid: bigint | number) => void)
        | undefined

      const rowsByKind = {
        users: [
          { id: 1, name: "Ada" },
          { id: 2, name: "Bob" }
        ],
        streamLarge: Array.from({ length: 70 }, (_, index) => ({
          id: index + 1,
          name: `User ${index + 1}`
        })),
        other: [{ name: "Cache" }]
      } as const
      let schemaRows: Array<{ name: string }> = [{ name: "users" }, { name: "posts" }]

      const getRows = (kind: keyof typeof rowsByKind | "schema") => (kind === "schema" ? schemaRows : rowsByKind[kind])

      const statementIndexes = new Map<string, number>()
      let statementId = 0
      const statementsBySql: Record<string, ReadonlyArray<keyof typeof rowsByKind | "schema">> = {
        "SELECT users": ["users"],
        "SELECT stream-large": ["streamLarge"],
        OTHER: ["other"],
        "SELECT multi": ["users", "other"],
        "SELECT name FROM sqlite_master WHERE type IN ('table', 'view')": ["schema"]
      }

      const sqlite3 = {
        statements: (_db: number, sql: string) =>
          (statementsBySql[sql] ?? ["other"]).map((kind) =>
            JSON.stringify({
              id: statementId++,
              kind
            })
          ),
        bind_collection: (_statement: string, _params: ReadonlyArray<unknown>) => {},
        step: (statement: string) => {
          const nextIndex = (statementIndexes.get(statement) ?? -1) + 1
          statementIndexes.set(statement, nextIndex)
          const kind = JSON.parse(statement).kind as keyof typeof rowsByKind | "schema"
          const rows = getRows(kind)
          return nextIndex < rows.length ? WaSqlite.SQLITE_ROW : 0
        },
        column_names: (statement: string) => {
          const kind = JSON.parse(statement).kind as keyof typeof rowsByKind | "schema"
          return Object.keys(getRows(kind)[0] ?? {})
        },
        row: (statement: string) =>
          Object.values(
            getRows(JSON.parse(statement).kind as keyof typeof rowsByKind | "schema")[
              statementIndexes.get(statement) ?? -1
            ] ?? {}
          ),
        finalize: (statement: string) => {
          statementIndexes.delete(statement)
        },
        serialize: () => new Uint8Array([4, 5, 6]),
        open_v2: (name: string) => {
          sqliteCalls.push(`open:${name}`)
          return 99
        },
        deserialize: (_db: number, _name: string, data: Uint8Array<ArrayBufferLike>) => {
          sqliteCalls.push(`deserialize:${_db}`)
          expect(_db).toBe(99)
          schemaRows = [{ name: "posts" }, { name: "archived_users" }]
          return data.length
        },
        backup: (dest: number, destName: string, source: number, sourceName: string) => {
          sqliteCalls.push(`backup:${destName}:${sourceName}:${dest}:${source}`)
          expect(dest).toBe(1)
          expect(source).toBe(99)
          return 0
        },
        close: (db: number) => {
          sqliteCalls.push(`close:${db}`)
          return 0
        },
        _getUsedSize: () => 512,
        update_hook: (
          _db: number,
          callback: (op: number, databaseName: string | null, table: string | null, rowid: bigint | number) => void
        ) => {
          updateHook = callback
        }
      }

      const clientFactory = yield* handleRelayServer({
        channel: {
          handle: (schema: { _tag: string }, handler: (payload: any) => Effect.Effect<any, any>) => {
            handles.set(schema._tag, handler)
          },
          send: (message: any, options?: unknown) => {
            sent.push({ message, options })
            return Effect.succeed("ok")
          }
        } as any,
        sqlite3: sqlite3 as any,
        db: 1,
        onUpdate: (event) =>
          Effect.sync(() => {
            updates.push(event as SqliteUpdateHookEvent | SqliteInvalidateTablesEvent)
          }),
        hasReady: () => false
      })

      expect(yield* clientFactory.run("SELECT multi", [], "object")).toEqual([
        { id: 1, name: "Ada" },
        { id: 2, name: "Bob" },
        { name: "Cache" }
      ])
      expect(Array.from(yield* Stream.runCollect(clientFactory.runStream("SELECT multi", [])))).toEqual([
        { id: 1, name: "Ada" },
        { id: 2, name: "Bob" },
        { name: "Cache" }
      ])
      expect(Array.from(yield* clientFactory.export)).toEqual([4, 5, 6])
      expect(yield* clientFactory.import(new Uint8Array([1, 2, 3]))).toBeUndefined()
      expect(yield* clientFactory.getUsedSize).toBe(512)

      const queryHandler = handles.get(SqliteQueryExecute._tag) as (payload: any) => Effect.Effect<any, any>
      const streamOpenHandler = handles.get(SqliteQueryStreamOpen._tag) as (payload: any) => Effect.Effect<any, any>
      const streamNextHandler = handles.get(SqliteQueryStreamNext._tag) as (payload: any) => Effect.Effect<any, any>
      const streamCloseHandler = handles.get(SqliteQueryStreamClose._tag) as (payload: any) => Effect.Effect<any, any>
      const readyHandler = handles.get(SqliteWorkerReadyEvent._tag) as (payload: any) => Effect.Effect<any, any>
      assert(queryHandler)
      assert(streamOpenHandler)
      assert(streamNextHandler)
      assert(streamCloseHandler)
      assert(readyHandler)

      expect(
        yield* queryHandler({
          sql: "SELECT users",
          params: [],
          rowMode: "array"
        })
      ).toEqual([
        [1, "Ada"],
        [2, "Bob"]
      ])
      expect(
        yield* streamOpenHandler({
          sql: "SELECT stream-large",
          params: []
        })
      ).toEqual({
        streamId: "stream-0",
        rows: Array.from({ length: 64 }, (_, index) => ({
          id: index + 1,
          name: `User ${index + 1}`
        })),
        done: false
      })
      expect(
        yield* streamNextHandler({
          streamId: "stream-0"
        })
      ).toEqual({
        streamId: undefined,
        rows: Array.from({ length: 6 }, (_, index) => ({
          id: index + 65,
          name: `User ${index + 65}`
        })),
        done: true
      })
      expect(yield* streamCloseHandler({ streamId: "stream-0" })).toBeUndefined()
      expect(yield* readyHandler({})).toEqual({ state: "unknown" })

      assert(updateHook)
      updateHook(18, "main", "users", 5)
      yield* Effect.promise(() => new Promise((resolve) => setTimeout(resolve, 0)))
      updateHook(18, "main", "sql_migrations", 6)
      yield* Effect.promise(() => new Promise((resolve) => setTimeout(resolve, 0)))

      updateHook(18, "main", "users", 9_007_199)
      yield* Effect.promise(() => new Promise((resolve) => setTimeout(resolve, 0)))

      expect(updates).toEqual([
        SqliteInvalidateTablesEvent.make(
          { db: "main", tables: ["users", "posts", "archived_users"] },
          { disableValidation: true }
        ),
        SqliteUpdateHookEvent.make({ op: 18, db: "main", table: "users", rowid: "5" }, { disableValidation: true }),
        SqliteUpdateHookEvent.make(
          { op: 18, db: "main", table: "users", rowid: "9007199" },
          { disableValidation: true }
        )
      ])
      expect(sent.map((entry) => entry.message._tag)).toEqual([
        SqliteBroadcastUpdates._tag,
        SqliteBroadcastUpdates._tag,
        SqliteBroadcastUpdates._tag
      ])
      expect(sqliteCalls).toContain("open::memory:")
      expect(sqliteCalls).toContain("deserialize:99")
      expect(sqliteCalls).toContain("backup:main:main:1:99")
      expect(sqliteCalls).toContain("close:99")
    })
  )

  it.scoped("wraps sqlite execution failures with `SqlError` on the server side", () =>
    Effect.gen(function* () {
      const handles: HandleMap = new Map()

      yield* handleRelayServer({
        channel: {
          handle: (schema: { _tag: string }, handler: (payload: any) => Effect.Effect<any, any>) => {
            handles.set(schema._tag, handler)
          },
          send: () => Effect.succeed("ok")
        } as any,
        sqlite3: {
          statements: () => {
            throw new Error("bad statement")
          },
          update_hook: () => {},
          serialize: () => new Uint8Array(),
          deserialize: () => 0,
          _getUsedSize: () => 0
        } as any,
        db: 1,
        onUpdate: () => Effect.void,
        hasReady: () => true
      })

      const queryHandler = handles.get(SqliteQueryExecute._tag) as (payload: any) => Effect.Effect<any, any>
      assert(queryHandler)

      const exit = yield* Effect.exit(
        queryHandler({
          sql: "SELECT broken",
          params: [],
          rowMode: "object"
        })
      )

      assert(Exit.isFailure(exit))
      assert(Cause.isFailType(exit.cause))
      expect(exit.cause.error._tag).toBe("SqlError")
      expect(exit.cause.error.message).toBe("Failed to execute statement")
    })
  )

  it.scoped("holds the main connection while a relay stream session remains open", () =>
    Effect.gen(function* () {
      const handles: HandleMap = new Map()
      const sqliteCalls: Array<string> = []
      let stepCount = 0

      yield* handleRelayServer({
        channel: {
          handle: (schema: { _tag: string }, handler: (payload: any) => Effect.Effect<any, any>) => {
            handles.set(schema._tag, handler)
          },
          send: () => Effect.succeed("ok")
        } as any,
        sqlite3: {
          statements: (_db: number, sql: string) => (sql === "SELECT stream-large" ? ["stream"] : []),
          bind_collection: () => {},
          step: (statement: string) => {
            if (statement !== "stream") {
              return 0
            }

            if (stepCount >= 65) {
              return 0
            }

            sqliteCalls.push("step")
            stepCount += 1
            return WaSqlite.SQLITE_ROW
          },
          column_names: () => ["id"],
          row: () => [stepCount],
          serialize: () => {
            sqliteCalls.push("serialize")
            return new Uint8Array([1, 2, 3])
          },
          update_hook: () => {},
          _getUsedSize: () => 0
        } as any,
        db: 1,
        onUpdate: () => Effect.void,
        hasReady: () => true
      })

      const streamOpenHandler = handles.get(SqliteQueryStreamOpen._tag) as (payload: any) => Effect.Effect<any, any>
      const streamCloseHandler = handles.get(SqliteQueryStreamClose._tag) as (payload: any) => Effect.Effect<any, any>
      const exportHandler = handles.get(SqliteExportExecute._tag) as (payload: any) => Effect.Effect<any, any>
      assert(streamOpenHandler)
      assert(streamCloseHandler)
      assert(exportHandler)

      const opened = yield* streamOpenHandler({
        sql: "SELECT stream-large",
        params: []
      })

      expect(opened.streamId).toBe("stream-0")
      expect(opened.done).toBe(false)
      expect(opened.rows).toHaveLength(64)

      const exportFiber = yield* Effect.fork(exportHandler({}))
      yield* Effect.yieldNow()

      expect(sqliteCalls).toHaveLength(64)

      yield* streamCloseHandler({ streamId: "stream-0" })
      expect(Array.from(yield* Fiber.join(exportFiber))).toEqual([1, 2, 3])

      expect(sqliteCalls).toHaveLength(65)
      expect(sqliteCalls.at(-1)).toBe("serialize")
    })
  )
})
