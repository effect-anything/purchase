import * as EventLogStatesWorker from "./EventLogStatesWorker.ts"
import * as EventLogWorkerPool from "./Pool.ts"
import * as EventLogSchema from "./Schema.ts"
import { EventEmitter } from "./Utils.ts"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"

export * from "./EventLogStatesWorker.ts"

export const layer = Layer.scoped(
  EventLogStatesWorker.EventLogStates,
  Effect.gen(function* () {
    const worker = yield* EventLogWorkerPool.WorkerPool

    const stream = worker.execute(new EventLogSchema.EventLogEventStreamEvent()).pipe(Stream.orDie)
    const events = new EventEmitter()

    yield* stream.pipe(
      Stream.tap((_) => Effect.sync(() => events.emit("sync-event", _))),
      Stream.runDrain,
      Effect.forkScoped
    )

    const methods = yield* EventLogStatesWorker.make(events)

    return {
      ...methods,
      offer: (_: any) => Effect.succeed(false)
    }
  }).pipe(Effect.withLogSpan("@event-log/states"))
)
