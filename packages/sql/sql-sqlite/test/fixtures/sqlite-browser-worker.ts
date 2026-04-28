/// <reference lib="webworker" />

import { Migrator } from "@effect-x/db"
import * as SqliteSchema from "@effect-x/sql-sqlite/schema"
import * as SqliteWorker from "@effect-x/sql-sqlite/worker"
import * as Reactivity from "@effect/experimental/Reactivity"
import * as BrowserWorkerRunner from "@effect/platform-browser/BrowserWorkerRunner"
import * as WorkerRunner from "@effect/platform/WorkerRunner"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"

const workerUrl = new URL(self.location.href)
const dbName = workerUrl.searchParams.get("dbName") ?? "sqlite-browser-test"
const cleanupOnClose = workerUrl.searchParams.get("cleanupOnClose") === "1"
const debug = workerUrl.searchParams.get("debug") === "1"
const fkEnabled = workerUrl.searchParams.get("fkEnabled") === "1"
const rawMigrations = workerUrl.searchParams.get("migrations")
const migrations = rawMigrations
  ? (JSON.parse(rawMigrations) as {
      schemaSql?: string | undefined
      records?: Record<string, string> | undefined
    })
  : undefined

if (debug) {
  ;(globalThis as typeof globalThis & { __sqlite_lock_debug?: boolean }).__sqlite_lock_debug = true
}

const workerLive = pipe(
  SqliteWorker.layer({
    cleanupOnClose,
    dbName,
    fkEnabled
  }),
  Layer.provide([
    Migrator.fromRecord(() => ({
      schemaSql: migrations?.schemaSql,
      migrations: migrations?.records ?? {}
    })),
    Reactivity.layer
  ]),
  Layer.orDie,
  Layer.tapErrorCause(Effect.logError)
)

WorkerRunner.launch(
  Layer.provide(
    Layer.unwrapEffect(
      Effect.map(SqliteWorker.workerHandles(), (handlers) =>
        WorkerRunner.layerSerialized(SqliteSchema.SqliteEvent, handlers)
      )
    ),
    workerLive
  )
).pipe(Effect.provide(BrowserWorkerRunner.layer), Effect.runFork)
