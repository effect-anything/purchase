import { Emailer } from "../emailer.ts"
import { LocalLive } from "./local.ts"
import { EmailerMultiProvider } from "./provider.ts"
import { ResendLive } from "./resend.ts"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

export const EmailerNodeLive = Layer.effect(
  Emailer,
  Effect.gen(function* () {
    const send = () => Effect.dieMessage("emailer send not implemented")

    const sendTemplate = () => Effect.dieMessage("email send template not implemented")

    return {
      send,
      sendTemplate
    }
  })
).pipe(
  Layer.provide(
    EmailerMultiProvider.make({
      local: LocalLive,
      resend: ResendLive
    })
  )
)
