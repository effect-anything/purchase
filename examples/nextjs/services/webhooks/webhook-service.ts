import type { PaymentProviderTag } from "@effect-x/purchase"

import { Context, Effect, Layer } from "effect"

import { PurchaseService } from "../purchase/purchase-service"

export class WebhookService extends Context.Tag("WebhookService")<
  WebhookService,
  {
    readonly process: (input: {
      readonly provider: PaymentProviderTag
      readonly body: string
      readonly signature: string
    }) => Effect.Effect<
      {
        readonly accepted: boolean
        readonly providerEventId: string
        readonly normalizedEvents: ReadonlyArray<{
          readonly id: string
          readonly kind: string
          readonly offerId: string | null
          readonly customerId: string | null
        }>
        readonly reconciliationReasons: ReadonlyArray<string>
      },
      unknown
    >
  }
>() {
  static Default = Layer.effect(
    WebhookService,
    Effect.gen(function* () {
      const purchase = yield* PurchaseService

      const process = Effect.fn(function* (input: {
        readonly provider: PaymentProviderTag
        readonly body: string
        readonly signature: string
      }) {
        const result = yield* purchase.webhooks.handle({
          provider: input.provider,
          body: input.body,
          signature: input.signature
        })

        return {
          accepted: result.accepted,
          providerEventId: result.providerEventId,
          normalizedEvents: result.normalizedEvents.map((event) => ({
            id: event.id,
            kind: event.kind,
            offerId: event.offerId ?? null,
            customerId: event.customerId ?? null
          })),
          reconciliationReasons: result.reconciliationTriggers.map((trigger) => trigger.reason)
        } as const
      })

      return { process } as const
    })
  )
}
