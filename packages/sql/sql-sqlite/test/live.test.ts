import * as Reactivity from "@effect/experimental/Reactivity"
import * as SqlClient from "@effect/sql/SqlClient"
import { describe, expect, it } from "@effect/vitest"
import { Deferred, Effect, Fiber, Runtime, Stream } from "effect"

import { effectQuery } from "../src/live.ts"

describe("live query runtime", () => {
  it.effect("transforms rows, tracks SQL table dependencies, and runs start/end callbacks", () =>
    Effect.gen(function* () {
      const reactivity = yield* Reactivity.make
      const runtime = yield* Effect.runtime<never>()
      const runFork = Runtime.runFork(runtime)
      const started = yield* Deferred.make<void>()
      const calls: Array<string> = []
      let executions = 0

      const sqlClient = {
        unsafe: () => ({
          withoutTransform: Effect.sync(() => {
            executions += 1
            calls.push(`query:${executions}`)

            if (executions === 1) {
              runFork(Deferred.succeed(started, void 0))
            }

            return [{ id: executions }]
          })
        })
      } as unknown as SqlClient.SqlClient

      const fiber = yield* Effect.fork(
        Stream.runCollect(
          effectQuery({
            execute: () => "SELECT id FROM users",
            options: {
              transform: (rows: Array<{ id: number }>) => rows.map((row) => ({ label: `user-${row.id}` })),
              onStart: () => calls.push("start"),
              onEnd: () => calls.push("end")
            }
          }).pipe(Stream.take(2))
        ).pipe(
          Effect.provideService(Reactivity.Reactivity, reactivity),
          Effect.provideService(SqlClient.SqlClient, sqlClient)
        )
      )

      yield* Deferred.await(started)
      yield* reactivity.invalidate({ users: [] })

      const results = Array.from(yield* Fiber.join(fiber))

      expect(results).toEqual([[{ label: "user-1" }], [{ label: "user-2" }]])
      expect(calls).toEqual(["start", "query:1", "query:2", "end"])
    })
  )

  it.effect("tracks base tables for WITH queries instead of only the cte alias", () =>
    Effect.gen(function* () {
      const reactivity = yield* Reactivity.make
      const runtime = yield* Effect.runtime<never>()
      const runFork = Runtime.runFork(runtime)
      const started = yield* Deferred.make<void>()
      let executions = 0

      const sqlClient = {
        unsafe: () => ({
          withoutTransform: Effect.sync(() => {
            executions += 1

            if (executions === 1) {
              runFork(Deferred.succeed(started, void 0))
            }

            return [{ id: executions }]
          })
        })
      } as unknown as SqlClient.SqlClient

      const fiber = yield* Effect.fork(
        Stream.runCollect(
          effectQuery({
            execute: () => `
              WITH active_users AS (
                SELECT id
                FROM users
              )
              SELECT id
              FROM active_users
            `
          }).pipe(Stream.take(2))
        ).pipe(
          Effect.provideService(Reactivity.Reactivity, reactivity),
          Effect.provideService(SqlClient.SqlClient, sqlClient)
        )
      )

      yield* Deferred.await(started)
      yield* reactivity.invalidate({ users: [] })

      const results = Array.from(yield* Fiber.join(fiber))

      expect(results).toEqual([[{ id: 1 }], [{ id: 2 }]])
      expect(executions).toBe(2)
    })
  )
})
