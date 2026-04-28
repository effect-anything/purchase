import type * as EventLogSchema from "./Schema.ts"
import type * as EffectWorker from "@effect/platform/Worker"

import * as Context from "effect/Context"

export interface WorkerPoolEvent extends EffectWorker.SerializedWorkerPool<EventLogSchema.LocalFirstEvent> {}

export const WorkerPool = Context.GenericTag<WorkerPoolEvent>("@local-first:worker-pool")
