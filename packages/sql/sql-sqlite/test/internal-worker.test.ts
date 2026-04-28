import { Reactivity } from "@effect/experimental"
import { assert, describe, expect, it } from "@effect/vitest"
import { Cause, Deferred, Effect, Exit, Fiber, Stream } from "effect"

import * as InternalWorker from "../src/internal/worker.ts"

const withReactivity = <A, E>(effect: Effect.Effect<A, E, Reactivity.Reactivity>) =>
  effect.pipe(Effect.provide(Reactivity.layer))

describe("internal worker client", () => {
  it.effect("delegates query execution, streaming, and import/export to sqlite3 api", () =>
    Effect.gen(function* () {
      const calls: Array<unknown> = []
      const sqlite3Api = {
        run: (sql: string, params: ReadonlyArray<unknown>, rowMode: "object" | "array" = "object") => {
          calls.push({ type: "run", sql, params: Array.from(params), rowMode })

          return Effect.succeed(rowMode === "array" ? [[1, "Ada"]] : [{ user_name: "Ada" }])
        },
        runStream: (sql: string, params: ReadonlyArray<unknown>) => {
          calls.push({ type: "runStream", sql, params: Array.from(params) })
          return Stream.fromIterable([{ first_value: 1 }, { first_value: 2 }])
        },
        export: Effect.succeed(new Uint8Array([4, 5, 6])),
        import: (data: Uint8Array<ArrayBufferLike>) =>
          Effect.sync(() => {
            calls.push({ type: "import", data: Array.from(data) })
          }),
        getUsedSize: Effect.succeed(42)
      }

      const client = yield* InternalWorker.make({
        sqlite3Api,
        transformQueryNames: (value) => `db_${value}`,
        transformResultNames: (value) => value.toUpperCase()
      })

      const rows = yield* client`SELECT ${1} AS ${client("userName")}`
      const values = yield* client.unsafe("SELECT 1, 2", []).values
      const streamRows = yield* Stream.runCollect(client.unsafe("SELECT 1", []).stream)
      const bytes = yield* client.export
      yield* client.import(new Uint8Array([7, 8]))

      expect(rows).toEqual([{ USER_NAME: "Ada" }])
      expect(values).toEqual([[1, "Ada"]])
      expect(Array.from(streamRows)).toEqual([{ FIRST_VALUE: 1 }, { FIRST_VALUE: 2 }])
      expect(Array.from(bytes)).toEqual([4, 5, 6])
      expect(calls).toEqual([
        {
          type: "run",
          sql: 'SELECT ? AS "db_userName"',
          params: [1],
          rowMode: "object"
        },
        {
          type: "run",
          sql: "SELECT 1, 2",
          params: [],
          rowMode: "array"
        },
        {
          type: "runStream",
          sql: "SELECT 1",
          params: []
        },
        {
          type: "import",
          data: [7, 8]
        }
      ])
    }).pipe(withReactivity)
  )

  it.effect("opens and commits transactions through the sqlite api", () =>
    Effect.gen(function* () {
      const calls: Array<string> = []
      const sql = yield* InternalWorker.make({
        sqlite3Api: {
          run: (sqlStr: string, _params: ReadonlyArray<unknown>, rowMode: "object" | "array" = "object") =>
            Effect.sync(() => {
              calls.push(`${sqlStr}:${rowMode}`)
              return []
            }),
          runStream: () => Stream.empty,
          export: Effect.succeed(new Uint8Array()),
          import: () => Effect.void,
          getUsedSize: Effect.succeed(0)
        }
      })

      yield* sql.withTransaction(sql.unsafe("SELECT 1", []).withoutTransform)

      expect(calls).toEqual(["BEGIN:object", "SELECT 1:object", "COMMIT:object"])
    }).pipe(withReactivity)
  )

  it.effect("rolls back transactions when the effect fails", () =>
    Effect.gen(function* () {
      const calls: Array<string> = []
      const sql = yield* InternalWorker.make({
        sqlite3Api: {
          run: (sqlStr: string, _params: ReadonlyArray<unknown>, rowMode: "object" | "array" = "object") =>
            Effect.sync(() => {
              calls.push(`${sqlStr}:${rowMode}`)
              return []
            }),
          runStream: () => Stream.empty,
          export: Effect.succeed(new Uint8Array()),
          import: () => Effect.void,
          getUsedSize: Effect.succeed(0)
        }
      })

      const exit = yield* Effect.exit(sql.withTransaction(Effect.fail("boom")))

      assert(Exit.isFailure(exit))
      assert(Cause.isFailType(exit.cause))
      expect(exit.cause.error).toBe("boom")
      expect(calls).toEqual(["BEGIN:object", "ROLLBACK:object"])
    }).pipe(withReactivity)
  )

  it.effect("serializes direct runStream access with other exclusive operations", () =>
    Effect.gen(function* () {
      const calls: Array<string> = []
      const streamStarted = yield* Deferred.make<void>()
      const releaseStream = yield* Deferred.make<void>()

      const client = yield* InternalWorker.make({
        sqlite3Api: {
          run: () => Effect.succeed([]),
          runStream: () => {
            calls.push("runStream")

            return Stream.fromEffect(Deferred.succeed(streamStarted, void 0)).pipe(
              Stream.zipRight(Stream.fromEffect(Deferred.await(releaseStream).pipe(Effect.as({ id: 1 }))))
            )
          },
          export: Effect.sync(() => {
            calls.push("export")
            return new Uint8Array([1])
          }),
          import: () => Effect.void,
          getUsedSize: Effect.succeed(0)
        }
      })

      const streamFiber = yield* Effect.fork(Stream.runDrain(client.runStream("SELECT 1", [])))
      yield* Deferred.await(streamStarted)

      const exportFiber = yield* Effect.fork(client.export)
      yield* Effect.yieldNow()

      expect(calls).toEqual(["runStream"])

      yield* Deferred.succeed(releaseStream, void 0)

      expect(Array.from(yield* Fiber.join(exportFiber))).toEqual([1])
      yield* Fiber.join(streamFiber)

      expect(calls).toEqual(["runStream", "export"])
    }).pipe(withReactivity)
  )
})
