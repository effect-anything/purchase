import { Reactivity } from "@effect/experimental"
import { assert, describe, expect, it } from "@effect/vitest"
import { Cause, Effect, Exit, Stream } from "effect"

import * as InternalClient from "../src/internal/client.ts"

const withReactivity = <A, E>(effect: Effect.Effect<A, E, Reactivity.Reactivity>) =>
  effect.pipe(Effect.provide(Reactivity.layer))

describe("internal client", () => {
  it.effect("compiles queries, delegates execution, and supports export/import", () =>
    Effect.gen(function* () {
      const calls: Array<unknown> = []
      const relay = {
        run: (execute: any) => {
          calls.push(execute)

          return Effect.succeed(execute.rowMode === "array" ? [[1, "Ada"]] : [{ test_value: 1, display_name: "Ada" }])
        },
        runStream: (_execute: any) => Stream.empty,
        export: Effect.succeed(new Uint8Array([1, 2, 3])),
        import: (data: Uint8Array<ArrayBufferLike>) =>
          Effect.sync(() => {
            calls.push({ type: "import", data: Array.from(data) })
          })
      }

      const sql = yield* InternalClient.make({
        relay,
        transformQueryNames: (value) => `db_${value}`,
        transformResultNames: (value) => value.toUpperCase()
      })

      const rows = yield* sql`
        SELECT ${1} AS ${sql("testValue")}, ${"Ada"} AS ${sql("displayName")}
      `
      const values = yield* sql.unsafe("SELECT 1, 2", []).values
      const bytes = yield* sql.export
      yield* sql.import(new Uint8Array([9, 8]))

      expect(rows).toEqual([{ TEST_VALUE: 1, DISPLAY_NAME: "Ada" }])
      expect(values).toEqual([[1, "Ada"]])
      expect(Array.from(bytes)).toEqual([1, 2, 3])
      expect(calls).toEqual([
        expect.objectContaining({
          _tag: "SqliteQueryExecute",
          sql: expect.stringContaining('SELECT ? AS "db_testValue", ? AS "db_displayName"'),
          params: [1, "Ada"],
          rowMode: "object"
        }),
        expect.objectContaining({
          _tag: "SqliteQueryExecute",
          sql: "SELECT 1, 2",
          params: [],
          rowMode: "array"
        }),
        {
          type: "import",
          data: [9, 8]
        }
      ])
    }).pipe(withReactivity)
  )

  it.effect("wraps non-schema relay failures for execute and stream operations", () =>
    Effect.gen(function* () {
      const queryCause = { message: "query boom" }
      const streamCause = { message: "stream boom" }
      const client = yield* InternalClient.make({
        relay: {
          run: () => Effect.fail(queryCause as any),
          runStream: () => Stream.fail(streamCause as any),
          export: Effect.succeed(new Uint8Array()),
          import: () => Effect.void
        }
      })

      const executeExit = yield* Effect.exit(client.unsafe("SELECT 1", []).withoutTransform)
      const streamExit = yield* Effect.exit(Stream.runCollect(client.unsafe("SELECT 1", []).stream))

      assert(Exit.isFailure(executeExit))
      assert(Cause.isFailType(executeExit.cause))
      expect(executeExit.cause.error._tag).toBe("SqlError")
      expect(executeExit.cause.error.message).toBe("query execute error")
      expect(executeExit.cause.error.cause).toEqual(queryCause)

      assert(Exit.isFailure(streamExit))
      assert(Cause.isFailType(streamExit.cause))
      expect(streamExit.cause.error._tag).toBe("SqlError")
      expect(streamExit.cause.error.message).toBe("query stream execute error")
      expect(streamExit.cause.error.cause).toEqual(streamCause)
    }).pipe(withReactivity)
  )
})
