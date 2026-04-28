import type * as EffectWorker from "@effect/platform/Worker"
import type * as SqliteSchema from "./schema.ts"

import * as Context from "effect/Context"

export interface WorkerPoolEvent extends EffectWorker.SerializedWorkerPool<SqliteSchema.SqliteEvent> {}

export class WorkerPool extends Context.Tag("@effect-x/sql-sqlite/worker-pool")<WorkerPool, WorkerPoolEvent>() {}
