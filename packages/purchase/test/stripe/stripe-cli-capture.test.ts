import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"

import { Stripe } from "../../src/stripe.ts"
import { StripeClientLayer, StripeConfigFromRecord } from "../../src/stripe/internal/stripe-client.ts"
import { captureStripeWebhook, stripeCliAvailable } from "../support/stripe-cli.ts"

describe.runIf(() => process.env.STRIPE_LIVE_TESTS === "1" && stripeCliAvailable)(
  "provider-live Stripe CLI capture",
  () => {
    it.effect("captures a real Stripe CLI webhook and validates it through the provider", () =>
      Effect.scoped(
        Effect.gen(function* () {
          const captured = yield* captureStripeWebhook({
            event: "checkout.session.completed",
            env: process.env
          })

          const provider = yield* Stripe.make.pipe(
            Effect.provide(
              StripeClientLayer.pipe(
                Layer.provide(
                  StripeConfigFromRecord({
                    apiKey: Redacted.make(process.env.STRIPE_API_KEY ?? "sk_test_fixture"),
                    webhookSecret: Redacted.make(captured.webhookSecret),
                    environment: "sandbox"
                  })
                )
              )
            )
          )

          const event = yield* provider.webhooksUnmarshal({
            payload: captured.payload,
            signature: captured.signature
          })

          expect(event.type).toBe("checkout.session.completed")
        })
      )
    )
  }
)
