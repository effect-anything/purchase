import type { EmailMessage, EmailSendResult } from "@cloudflare/workers-types"
import type * as Effect from "effect/Effect"

import * as Context from "effect/Context"

export interface EmailEvent {
  readonly raw: ReadableStream<Uint8Array>
  readonly headers: Headers
  readonly rawSize: number
  setReject: (reason: string) => Effect.Effect<void>
  forward: (rcptTo: string, headers?: Headers) => Effect.Effect<EmailSendResult>
  reply: (message: EmailMessage) => Effect.Effect<EmailSendResult>
}
export const EmailEvent = Context.GenericTag<EmailEvent>("@cloudflare:email-message")
