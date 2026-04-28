import * as EventLog from "./EventLog.ts"
import * as EventLogWorkerPool from "./Pool.ts"
import * as EventLogSchema from "./Schema.ts"
import { EventEmitter } from "./Utils.ts"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

export const EventLogWorker = Layer.effect(
  EventLog.EventLog,
  Effect.gen(function* () {
    const workerPool = yield* EventLogWorkerPool.WorkerPool

    return EventLog.EventLog.of({
      write: (options) =>
        workerPool
          .executeEffect(new EventLogSchema.EventLogWriteRequest({ event: options.event, payload: options.payload }))
          .pipe(Effect.orDie),

      destroy: Effect.void,

      entries: workerPool.executeEffect(new EventLogSchema.EventLogEntriesRequest({})).pipe(Effect.orDie),

      registerRemote: () => Effect.void,

      removeRemote: () => Effect.void,

      events: new EventEmitter()
    })
  })
)
