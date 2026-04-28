import type * as Redacted from "effect/Redacted"

import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import { globalValue } from "effect/GlobalValue"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as SubscriptionRef from "effect/SubscriptionRef"

export const GlobalAccessToken = globalValue("@x/global-access-token", () =>
  Effect.runSync(SubscriptionRef.make(Option.none<Redacted.Redacted<string>>()))
)

const makeWorkerSession = Effect.gen(function* () {
  const changes = GlobalAccessToken.changes

  return {
    changes
  }
})

export class WorkerSession extends Context.Tag("WorkerSession")<
  WorkerSession,
  Effect.Effect.Success<typeof makeWorkerSession>
>() {}

export const WorkerSessionLayer = Layer.effect(WorkerSession, makeWorkerSession)
