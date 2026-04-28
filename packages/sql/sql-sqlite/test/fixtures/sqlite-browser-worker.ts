/// <reference lib="webworker" />

import { Migrator } from "@effect-x/db"
import * as FxWorkerRunner from "@effect-x/fx/worker/runner"
import { WorkerMessage } from "@effect-x/fx/worker/schema"
import * as SqliteSchema from "@effect-x/sql-sqlite/schema"
import * as SqliteWorker from "@effect-x/sql-sqlite/worker"
import * as Reactivity from "@effect/experimental/Reactivity"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Schema from "effect/Schema"
import * as Scope from "effect/Scope"

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
    migrations
      ? Migrator.fromRecord(() => ({
          schemaSql: migrations.schemaSql,
          migrations: migrations.records ?? {}
        }))
      : Layer.empty,
    Reactivity.layer
  ]),
  Layer.orDie,
  Layer.tapErrorCause(Effect.logError)
)

FxWorkerRunner.run(
  Schema.Union(...WorkerMessage.members, ...SqliteSchema.SqliteEvent.members),
  workerLive,
  [
    (scope: Scope.CloseableScope) =>
      Effect.runSync(SqliteWorker.workerHandles().pipe(Effect.provideService(Scope.Scope, scope)))
  ],
  {
    layer: Layer.empty
  }
)
