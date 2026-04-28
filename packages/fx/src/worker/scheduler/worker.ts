import { CoreWorkerPool } from "../pool.ts"
import * as WorkerSchema from "./schema.ts"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { Scheduler } from "./scheduler.ts"

/**
 * 在 Main thread 中被调用，将消息转发到 Worker 中
 */
const make = Effect.gen(function* () {
  const coreWorker = yield* CoreWorkerPool

  const init = coreWorker.executeEffect(new WorkerSchema.InitScheduler()).pipe(Effect.orDie)

  const invoke = (command: any) =>
    coreWorker.executeEffect(new WorkerSchema.SchedulerCommand({ command })).pipe(Effect.orDie)

  const emit = (event: any) => coreWorker.executeEffect(new WorkerSchema.SchedulerEvent({ event })).pipe(Effect.orDie)

  return {
    init,
    invoke,
    emit
  }
})

export const SchedulerMake = Layer.scoped(Scheduler, make)
