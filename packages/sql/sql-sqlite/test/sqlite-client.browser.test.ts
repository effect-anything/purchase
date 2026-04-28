import * as SqliteClient from "@effect-x/sql-sqlite/client"
import * as SqliteWorkerPool from "@effect-x/sql-sqlite/pool"
import * as FxWorkerPool from "@effect-x/fx/worker/pool"
import * as Reactivity from "@effect/experimental/Reactivity"
import * as SqlClient from "@effect/sql/SqlClient"
import { describe, expect, layer } from "@effect/vitest"
import { Effect, Exit, Layer, Logger, LogLevel, pipe, Stream } from "effect"

const describeBrowser = typeof window === "undefined" ? describe.skip : describe

const makeBrowserWorkerPoolLayer = (
  dbName: string,
  migrations?:
    | {
        schemaSql?: string | undefined
        records?: Record<string, string> | undefined
      }
    | undefined
) =>
  Layer.scoped(
    SqliteWorkerPool.WorkerPool,
    FxWorkerPool.make({
      size: 1,
      concurrency: 99,
      workerFactory: () => {
        const url = new URL("./fixtures/sqlite-browser-worker.ts", import.meta.url)
        url.searchParams.set("dbName", dbName)
        if (migrations) {
          url.searchParams.set("migrations", JSON.stringify(migrations))
        }
        return new Worker(url, { type: "module" })
      }
    }) as Effect.Effect<SqliteWorkerPool.WorkerPoolEvent>
  )

const makeBrowserSqliteLayer = (
  dbName: string,
  migrations?:
    | {
        schemaSql?: string | undefined
        records?: Record<string, string> | undefined
      }
    | undefined
) =>
  pipe(
    SqliteClient.layer(),
    Layer.provide(makeBrowserWorkerPoolLayer(dbName, migrations)),
    Layer.provide([Reactivity.layer, Logger.minimumLogLevel(LogLevel.All)]),
    Layer.orDie,
    Layer.tapErrorCause(Effect.logError)
  )

const persistedDbName = `sbr-${crypto.randomUUID().slice(0, 8)}`

describeBrowser("sqlite client browser integration", () => {
  layer(
    makeBrowserSqliteLayer(`sbe2e-${crypto.randomUUID().slice(0, 8)}`, {
      records: {
        "migrations/20240101000000-create-users/migration.sql": [
          "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT NOT NULL, source TEXT NOT NULL);",
          "INSERT INTO users (id, name, source) VALUES (1, 'Migrated', 'migration');"
        ].join("\n")
      }
    })
  )((it) => {
    it.effect(
      "queries through the public client and real web worker after sqlite migrations run",
      Effect.fn(function* () {
        const sql = yield* SqlClient.SqlClient

        const initialRows = yield* sql.unsafe("SELECT id, name, source FROM users ORDER BY id ASC").withoutTransform

        yield* sql.withTransaction(
          Effect.all(
            [
              sql.unsafe("INSERT INTO users (id, name, source) VALUES (?, ?, ?)", [2, "Ada", "client"])
                .withoutTransform,
              sql.unsafe("INSERT INTO users (id, name, source) VALUES (?, ?, ?)", [3, "Bob", "tx"]).withoutTransform
            ],
            { discard: true }
          )
        )

        const rollbackExit = yield* Effect.exit(
          sql.withTransaction(
            sql
              .unsafe("INSERT INTO users (id, name, source) VALUES (?, ?, ?)", [4, "Rollback", "tx"])
              .withoutTransform.pipe(Effect.zipRight(Effect.fail("boom")))
          )
        )
        expect(Exit.isFailure(rollbackExit)).toBe(true)

        const rows = yield* sql.unsafe("SELECT id, name, source FROM users ORDER BY id ASC").withoutTransform
        const values = yield* sql.unsafe("SELECT id, name FROM users ORDER BY id ASC").values
        const streamedRows = yield* Stream.runCollect(
          sql.unsafe("SELECT id, name, source FROM users ORDER BY id ASC").stream
        )

        expect(initialRows).toEqual([{ id: 1, name: "Migrated", source: "migration" }])
        expect(rows).toEqual([
          { id: 1, name: "Migrated", source: "migration" },
          { id: 2, name: "Ada", source: "client" },
          { id: 3, name: "Bob", source: "tx" }
        ])
        expect(values).toEqual([
          [1, "Migrated"],
          [2, "Ada"],
          [3, "Bob"]
        ])
        expect(Array.from(streamedRows)).toEqual(rows)
      })
    )
  })
})

describeBrowser("sqlite client browser persistence seed", () => {
  layer(makeBrowserSqliteLayer(persistedDbName))((it) => {
    it.effect(
      "creates the table and writes the first persisted row",
      Effect.fn(function* () {
        const sql = yield* SqlClient.SqlClient

        yield* sql.unsafe("CREATE TABLE IF NOT EXISTS persisted_users (id INTEGER PRIMARY KEY, name TEXT NOT NULL)")
          .withoutTransform
        yield* sql.unsafe("INSERT INTO persisted_users (id, name) VALUES (?, ?)", [1, "Seed"]).withoutTransform

        const rows = yield* sql.unsafe("SELECT id, name FROM persisted_users ORDER BY id ASC").withoutTransform

        expect(rows).toEqual([{ id: 1, name: "Seed" }])
      })
    )

    it.effect(
      "reads rows written by the previous worker layer and appends another row",
      Effect.fn(function* () {
        const sql = yield* SqlClient.SqlClient

        const initialRows = yield* sql.unsafe("SELECT id, name FROM persisted_users ORDER BY id ASC").withoutTransform

        yield* sql.unsafe("INSERT INTO persisted_users (id, name) VALUES (?, ?)", [2, "Restart"]).withoutTransform

        const rows = yield* sql.unsafe("SELECT id, name FROM persisted_users ORDER BY id ASC").withoutTransform
        const streamedRows = yield* Stream.runCollect(
          sql.unsafe("SELECT id, name FROM persisted_users ORDER BY id ASC").stream
        )

        expect(initialRows).toEqual([{ id: 1, name: "Seed" }])
        expect(rows).toEqual([
          { id: 1, name: "Seed" },
          { id: 2, name: "Restart" }
        ])
        expect(Array.from(streamedRows)).toEqual(rows)
      })
    )
  })
})
