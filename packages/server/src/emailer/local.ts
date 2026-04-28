import type { EmailProviderSendOptions } from "./schema.ts"

import { EmailerProvider } from "./provider.ts"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

export const LocalLive = Layer.sync(EmailerProvider, () => {
  const text = (_options: EmailProviderSendOptions, _content: string) =>
    Effect.logInfo("LOCAL: text email sent successfully").pipe(Effect.withSpan("Emailer.send-text"))

  const html = (_options: EmailProviderSendOptions, _content: string) =>
    Effect.logInfo("LOCAL: html email sent successfully").pipe(Effect.withSpan("Emailer.send-html"))

  return {
    text,
    html
  }
})
