import * as Reactivity from "@effect/experimental/Reactivity"
import * as SqlClient from "@effect/sql/SqlClient"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Stream } from "effect"

import * as InternalWorker from "../src/internal/worker.ts"
import { applyWorkerPragmas } from "../src/worker.ts"

const withReactivity = <A, E>(effect: Effect.Effect<A, E, Reactivity.Reactivity>) =>
  effect.pipe(Effect.provide(Reactivity.layer))

describe("worker pragma configuration", () => {
  it.effect("uses OPFS-safe defaults for AccessHandlePoolVFS", () =>
    Effect.gen(function* () {
      const queries: Array<string> = []
      const sql = yield* InternalWorker.make({
        sqlite3Api: {
          run: (statement: string) =>
            Effect.sync(() => {
              queries.push(statement)
              return []
            }),
          runStream: () => Stream.empty,
          export: Effect.succeed(new Uint8Array()),
          import: () => Effect.void,
          getUsedSize: Effect.succeed(0)
        }
      })

      yield* applyWorkerPragmas({ fkEnabled: true }).pipe(Effect.provideService(SqlClient.SqlClient, sql))

      expect(queries).toHaveLength(1)
      expect(queries[0]).toContain("PRAGMA journal_mode=WAL;")
      expect(queries[0]).toContain("PRAGMA synchronous=NORMAL;")
      expect(queries[0]).toContain("PRAGMA locking_mode=EXCLUSIVE;")
      expect(queries[0]).toContain("PRAGMA read_uncommitted=OFF;")
      expect(queries[0]).toContain("PRAGMA foreign_keys='ON';")
      expect(queries[0]).not.toContain("PRAGMA journal_mode=MEMORY;")
      expect(queries[0]).not.toContain("PRAGMA synchronous=OFF;")
      expect(queries[0]).not.toContain("PRAGMA read_uncommitted=ON;")
    }).pipe(withReactivity)
  )
})
