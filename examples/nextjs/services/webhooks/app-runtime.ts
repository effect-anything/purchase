import type { PaymentProviderTag } from "@effect-x/purchase"

import { Effect } from "effect"

import * as Next from "../../lib/nextjs/server-effect.ts"
import { WebhookService } from "./webhook-service.ts"

export const processWebhook = Next.serverFunction(
  (input: { readonly provider: PaymentProviderTag; readonly body: string; readonly signature: string }) =>
    Effect.gen(function* () {
      const webhooks = yield* WebhookService
      return yield* webhooks.process(input)
    })
)
