import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"

import { createLiveTestHarness } from "./support/provider-live-harness.ts"
import { runPayEffect } from "./support/run-pay-effect.ts"
import { queryOne } from "./support/sqlite-pay-harness.ts"
import { TestPay } from "./support/test-catalog.ts"
import { makeTestPaymentLayer } from "./support/test-payment-provider.ts"

describe("provider live harness", () => {
  it.effect("creates test customers through the shared harness API", () => {
    const payment = makeTestPaymentLayer()

    return runPayEffect(
      Effect.scoped(
        Effect.gen(function* () {
          const harness = yield* createLiveTestHarness({
            provider: "stripe",
            supportsTestClock: true,
            attachPaymentMethod: () => Effect.succeed({ attached: true }),
            advanceClock: () => Effect.succeed({ advanced: true })
          })

          const created = yield* harness.createTestCustomer({
            customerId: "customer_live_harness",
            email: "live@test.dev"
          })
          const customer = yield* queryOne<{ readonly id: string; readonly email: string }>(
            "SELECT id, email FROM paykit_customer WHERE id = ?",
            [created.customerId]
          )

          expect(customer).toEqual({
            id: "customer_live_harness",
            email: "live@test.dev"
          })
        })
      ),
      payment.layer
    )
  })

  it.effect("dispatches generated webhook fixtures through the SDK", () => {
    const payment = makeTestPaymentLayer()

    return runPayEffect(
      Effect.scoped(
        Effect.gen(function* () {
          const sdk = yield* TestPay
          const harness = yield* createLiveTestHarness({
            provider: "stripe",
            supportsWebhookSimulation: true,
            attachPaymentMethod: () => Effect.succeed({ attached: true })
          })

          yield* harness.createTestCustomer({})
          const result = yield* harness.dispatchWebhookFixture({
            sdk,
            eventType: "checkout.session.completed"
          })

          expect(result.accepted).toBe(true)
          expect(result.fixture.eventType).toBe("checkout.session.completed")
          expect(result.providerEventId).toBeTruthy()
        })
      ),
      payment.layer
    )
  })

  it.effect("retries until a projection-side assertion settles", () => {
    const payment = makeTestPaymentLayer()

    return runPayEffect(
      Effect.scoped(
        Effect.gen(function* () {
          const harness = yield* createLiveTestHarness({
            provider: "paddle",
            supportsWebhookSimulation: true
          })

          let attempts = 0
          const value = yield* harness.waitForProjectionSettled(
            Effect.try({
              try: () => {
                attempts += 1
                if (attempts < 3) {
                  throw new Error("not settled")
                }

                return attempts
              },
              catch: (error) => error
            }),
            {
              retries: 4,
              delayMs: 1
            }
          )

          expect(value).toBe(3)
        })
      ),
      payment.layer
    )
  })
})
