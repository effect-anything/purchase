import type { TaggedReq } from "./handle.ts"
import type { Request } from "effect/Request"

import * as Effect from "effect/Effect"

export class Scheduler extends Effect.Tag("@fx:worker:scheduler")<
  Scheduler,
  {
    readonly init: Effect.Effect<void>
    readonly invoke: <T extends InstanceType<TaggedReq>>(
      request: T
    ) => Effect.Effect<Request.Success<T>, Request.Error<T>>
    readonly emit: <T extends InstanceType<TaggedReq>>(request: T) => Effect.Effect<void>
  }
>() {}
