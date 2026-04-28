import * as SqliteClient from "@effect-x/sql-sqlite/client"
import * as SqlitePool from "@effect-x/sql-sqlite/pool"
import * as SqliteSchema from "@effect-x/sql-sqlite/schema"
import { Reactivity } from "@effect/experimental"
import * as SqlClient from "@effect/sql/SqlClient"
import { describe, expect, it } from "@effect/vitest"
import { Context, Effect, Layer, Stream } from "effect"

describe("browser client layer", () => {
  it.scoped("configures the relay transport and bridges worker runtime events on startup", () =>
    Effect.gen(function* () {
      const calls: Array<string> = []
      const invalidations: Array<Record<string, ReadonlyArray<unknown>>> = []
      const baseReactivity = yield* Reactivity.make
      const previousLockAcquire = (globalThis as typeof globalThis & { __x_sqlite_lockAcquire?: boolean })
        .__x_sqlite_lockAcquire
      const previousLockHook = (
        globalThis as typeof globalThis & {
          __x_sqlite_lockAcquireChange?: ((payload: { lockAcquire: boolean }) => void) | undefined
        }
      ).__x_sqlite_lockAcquireChange

      const reactivity: Reactivity.Reactivity.Service = {
        ...baseReactivity,
        invalidate: (keys) =>
          Effect.sync(() => {
            invalidations.push(keys as Record<string, ReadonlyArray<unknown>>)
          }).pipe(Effect.zipRight(baseReactivity.invalidate(keys)))
      }

      yield* Effect.addFinalizer(() =>
        Effect.sync(() => {
          const target = globalThis as typeof globalThis & {
            __x_sqlite_lockAcquire?: boolean
            __x_sqlite_lockAcquireChange?: ((payload: { lockAcquire: boolean }) => void) | undefined
          }

          if (previousLockAcquire === undefined) {
            delete target.__x_sqlite_lockAcquire
          } else {
            target.__x_sqlite_lockAcquire = previousLockAcquire
          }

          target.__x_sqlite_lockAcquireChange = previousLockHook
        })
      )

      const workerPool = {
        executeEffect: (message: { readonly _tag: string }) => {
          calls.push(message._tag)

          switch (message._tag) {
            case "SqliteQueryExecute":
              return Effect.succeed([{ ok: true }])
            default:
              return Effect.die(`unexpected executeEffect message: ${message._tag}`)
          }
        },
        execute: (message: { readonly _tag: string }) => {
          calls.push(message._tag)

          switch (message._tag) {
            case "SqliteStreamEvent":
              return Stream.fromIterable([
                new SqliteSchema.SqliteUpdateHookEvent({ op: 18, db: "main", table: "users", rowid: "1" }),
                new SqliteSchema.SqliteInvalidateTablesEvent({ db: "main", tables: ["users", "posts"] }),
                new SqliteSchema.SqliteLockChangeHookEvent({ lockAcquire: true })
              ])
            default:
              return Stream.empty
          }
        }
      } as unknown as SqlitePool.WorkerPoolEvent

      const scope = yield* Effect.scope
      const context = yield* Layer.buildWithScope(scope)(
        SqliteClient.layer().pipe(
          Layer.provide(Layer.succeed(SqlitePool.WorkerPool, workerPool)),
          Layer.provide(Layer.succeed(Reactivity.Reactivity, reactivity))
        )
      )

      const sql = Context.get(context, SqlClient.SqlClient)

      yield* Effect.yieldNow()

      const rows = yield* sql.unsafe("SELECT 1", []).withoutTransform.pipe(Effect.orDie)

      yield* Effect.yieldNow()

      expect(rows).toEqual([{ ok: true }])
      expect(calls).toContain("SqliteStreamEvent")
      expect(calls).toContain("SqliteQueryExecute")
      expect(invalidations).toEqual([{ users: ["1"] }, { users: [], posts: [] }])
      expect((globalThis as typeof globalThis & { __x_sqlite_lockAcquire?: boolean }).__x_sqlite_lockAcquire).toBe(true)
    })
  )
})
