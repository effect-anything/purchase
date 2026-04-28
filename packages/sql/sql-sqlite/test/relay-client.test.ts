import { assert, describe, expect, it } from "@effect/vitest"
import { Cause, Effect, Exit, Stream } from "effect"

import { RelayClient } from "../src/relay-client.ts"
import {
  SqliteExportExecute,
  SqliteImportExecute,
  SqliteQueryExecute,
  SqliteQueryStreamExecute
} from "../src/schema.ts"

describe("relay client service", () => {
  it.effect("fails fast before the worker transport is configured", () =>
    Effect.gen(function* () {
      const relay = yield* RelayClient

      const runExit = yield* Effect.exit(
        relay.run(
          new SqliteQueryExecute({ sql: "SELECT 1", params: [], rowMode: "object" }, { disableValidation: true })
        )
      )
      const streamExit = yield* Effect.exit(
        Stream.runCollect(
          relay.runStream(new SqliteQueryStreamExecute({ sql: "SELECT 1", params: [] }, { disableValidation: true }))
        )
      )

      assert(Exit.isFailure(runExit))
      assert(Cause.isFailType(runExit.cause))
      expect(runExit.cause.error._tag).toBe("SqlError")
      expect(runExit.cause.error.message).toContain("not configured")

      assert(Exit.isFailure(streamExit))
      assert(Cause.isFailType(streamExit.cause))
      expect(streamExit.cause.error._tag).toBe("SqlError")
      expect(streamExit.cause.error.message).toContain("not configured")
      expect(yield* relay.status).toBe("Uninitialized")
    }).pipe(Effect.provide(RelayClient.Default))
  )

  it.effect("delegates query, stream, export, and import calls to the worker pool", () =>
    Effect.gen(function* () {
      const calls: Array<string> = []
      const relay = yield* RelayClient

      yield* relay.configureWorkerTransport({
        executeEffect: (message: unknown) => {
          const tag = (message as { _tag: string })._tag
          calls.push(tag)

          switch (tag) {
            case "SqliteQueryExecute":
              return Effect.succeed([{ ok: true }])
            case "SqliteExportExecute":
              return Effect.succeed(new Uint8Array([1, 2, 3]))
            case "SqliteImportExecute":
              return Effect.void
            default:
              return Effect.die(`unexpected executeEffect message: ${tag}`)
          }
        },
        execute: (message: unknown) => {
          calls.push((message as { _tag: string })._tag)
          return Stream.fromIterable([[1], [2]])
        }
      } as any)

      const rows = yield* relay.run(
        new SqliteQueryExecute({ sql: "SELECT 1", params: [], rowMode: "object" }, { disableValidation: true })
      )
      const streamed = yield* Stream.runCollect(
        relay.runStream(new SqliteQueryStreamExecute({ sql: "SELECT 1", params: [] }, { disableValidation: true }))
      )
      const bytes = yield* relay.export
      yield* relay.import(new Uint8Array([9]))

      expect(rows).toEqual([{ ok: true }])
      expect(Array.from(streamed)).toEqual([[1], [2]])
      expect(Array.from(bytes)).toEqual([1, 2, 3])
      expect(yield* relay.status).toBe("Worker")
      expect(calls).toEqual([
        SqliteQueryExecute._tag,
        SqliteQueryStreamExecute._tag,
        SqliteExportExecute._tag,
        SqliteImportExecute._tag
      ])
    }).pipe(Effect.provide(RelayClient.Default))
  )

  it.effect("wraps worker and parse failures as `SqlError`", () =>
    Effect.gen(function* () {
      const relay = yield* RelayClient

      yield* relay.configureWorkerTransport({
        executeEffect: (message: unknown) => {
          const tag = (message as { _tag: string })._tag

          if (tag === SqliteQueryExecute._tag) {
            return Effect.fail({ _tag: "WorkerError", reason: "spawn" } as any)
          }

          if (tag === SqliteExportExecute._tag) {
            return Effect.fail({ _tag: "ParseError", issue: "bad-export" } as any)
          }

          return Effect.void
        },
        execute: () => Stream.fail({ _tag: "ParseError", issue: "bad-stream" } as any)
      } as any)

      const runExit = yield* Effect.exit(
        relay.run(
          new SqliteQueryExecute({ sql: "SELECT 1", params: [], rowMode: "object" }, { disableValidation: true })
        )
      )
      const streamExit = yield* Effect.exit(
        Stream.runCollect(
          relay.runStream(new SqliteQueryStreamExecute({ sql: "SELECT 1", params: [] }, { disableValidation: true }))
        )
      )
      const exportExit = yield* Effect.exit(relay.export)

      assert(Exit.isFailure(runExit))
      assert(Cause.isFailType(runExit.cause))
      expect(runExit.cause.error._tag).toBe("SqlError")
      expect(runExit.cause.error.message).toBe("worker error")

      assert(Exit.isFailure(streamExit))
      assert(Cause.isFailType(streamExit.cause))
      expect(streamExit.cause.error._tag).toBe("SqlError")
      expect(streamExit.cause.error.message).toBe("parse error")

      assert(Exit.isFailure(exportExit))
      assert(Cause.isFailType(exportExit.cause))
      expect(exportExit.cause.error._tag).toBe("SqlError")
      expect(exportExit.cause.error.message).toBe("parse error")
    }).pipe(Effect.provide(RelayClient.Default))
  )

  it.effect("wraps non-tagged stream failures as `SqlError`", () =>
    Effect.gen(function* () {
      const relay = yield* RelayClient
      const streamCause = { message: "stream exploded" }

      yield* relay.configureWorkerTransport({
        executeEffect: () => Effect.void,
        execute: () => Stream.fail(streamCause)
      } as any)

      const streamExit = yield* Effect.exit(
        Stream.runCollect(
          relay.runStream(new SqliteQueryStreamExecute({ sql: "SELECT 1", params: [] }, { disableValidation: true }))
        )
      )

      assert(Exit.isFailure(streamExit))
      assert(Cause.isFailType(streamExit.cause))
      expect(streamExit.cause.error._tag).toBe("SqlError")
      expect(streamExit.cause.error.message).toBe("stream query error")
      expect(streamExit.cause.error.cause).toEqual(streamCause)
    }).pipe(Effect.provide(RelayClient.Default))
  )

  it.effect("replaces the worker transport when a new runtime is configured", () =>
    Effect.gen(function* () {
      const relay = yield* RelayClient

      yield* relay.configureWorkerTransport({
        executeEffect: () => Effect.succeed([{ source: "first" }]),
        execute: () => Stream.fromIterable([[1]])
      } as any)

      const firstRows = yield* relay.run(
        new SqliteQueryExecute({ sql: "SELECT 1", params: [], rowMode: "object" }, { disableValidation: true })
      )

      yield* relay.configureWorkerTransport({
        executeEffect: (message: unknown) => {
          const tag = (message as { _tag: string })._tag

          switch (tag) {
            case "SqliteQueryExecute":
              return Effect.succeed([{ source: "second" }])
            case "SqliteExportExecute":
              return Effect.succeed(new Uint8Array([4, 5]))
            case "SqliteImportExecute":
              return Effect.void
            default:
              return Effect.die(`unexpected executeEffect message: ${tag}`)
          }
        },
        execute: () => Stream.fromIterable([[2], [3]])
      } as any)

      const secondRows = yield* relay.run(
        new SqliteQueryExecute({ sql: "SELECT 1", params: [], rowMode: "object" }, { disableValidation: true })
      )
      const secondStream = yield* Stream.runCollect(
        relay.runStream(new SqliteQueryStreamExecute({ sql: "SELECT 1", params: [] }, { disableValidation: true }))
      )
      const exported = yield* relay.export

      expect(firstRows).toEqual([{ source: "first" }])
      expect(secondRows).toEqual([{ source: "second" }])
      expect(Array.from(secondStream)).toEqual([[2], [3]])
      expect(Array.from(exported)).toEqual([4, 5])
      expect(yield* relay.status).toBe("Worker")
    }).pipe(Effect.provide(RelayClient.Default))
  )
})
