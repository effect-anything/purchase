import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"

import { runPayEffect } from "../test/support/run-pay-effect.ts"
import {
  countCoreRows,
  insertTestCustomer,
  parseJsonColumn,
  queryAll,
  queryOne
} from "../test/support/sqlite-pay-harness.ts"
import { TestPay, testCustomerId, testOfferIds } from "../test/support/test-catalog.ts"
import {
  makeTestPaymentLayer,
  TEST_CHECKOUT_SESSION_ID,
  TEST_CREATED_PRICE_ID,
  TEST_PROVIDER_CUSTOMER_ID,
  TEST_SUBSCRIPTION_ID
} from "../test/support/test-payment-provider.ts"

const checkoutCompletedNormalization = {
  providerEventId: "evt_test_checkout_completed",
  eventType: "checkout.session.completed",
  kind: "checkout_completed",
  occurredAt: new Date("2025-01-01T00:00:00.000Z"),
  resource: { id: TEST_CHECKOUT_SESSION_ID },
  metadata: {
    payCustomerId: "customer_123",
    payOfferId: testOfferIds.proMonthly
  },
  checkoutSessionId: TEST_CHECKOUT_SESSION_ID,
  providerCustomerId: TEST_PROVIDER_CUSTOMER_ID,
  providerSubscriptionId: TEST_SUBSCRIPTION_ID,
  providerOfferId: TEST_CREATED_PRICE_ID,
  status: "active"
} as const

const prepareCheckoutWebhook = Effect.gen(function* () {
  const sdk = yield* TestPay
  yield* insertTestCustomer({})
  yield* sdk.catalog.sync()
  yield* sdk.checkout.start({
    customerId: testCustomerId,
    offerId: testOfferIds.proMonthly,
    successUrl: "https://app.test/success",
    cancelUrl: "https://app.test/cancel"
  })

  return sdk
})

describe("core webhook workflow", () => {
  it.effect("webhook.receive persists receipt, commercial event, projections, and entitlements", () => {
    const payment = makeTestPaymentLayer({ normalizedWebhook: checkoutCompletedNormalization })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* prepareCheckoutWebhook
        const result = yield* sdk.webhooks.handle({
          provider: "stripe",
          body: JSON.stringify({ id: "evt_test_checkout_completed" }),
          signature: "test_signature"
        })

        expect(result.accepted).toBe(true)
        expect(result.providerEventId).toBe("evt_test_checkout_completed")
        expect(result.normalizedEvents).toHaveLength(1)
        expect(result.reconciliationTriggers.map((trigger) => trigger.reason)).toContain("checkout_completed")

        const receipt = yield* queryOne<{
          readonly provider_event_id: string
          readonly status: string
        }>("SELECT provider_event_id, status FROM paykit_webhook_event WHERE provider_event_id = ?", [
          "evt_test_checkout_completed"
        ])
        expect(receipt).toMatchObject({
          provider_event_id: "evt_test_checkout_completed",
          status: "processed"
        })

        const event = yield* queryOne<{
          readonly id: string
          readonly kind: string
          readonly customer_id: string
          readonly offer_id: string
          readonly payload: string
        }>("SELECT * FROM paykit_commercial_event WHERE id = ?", ["stripe:evt_test_checkout_completed"])
        expect(event).toMatchObject({
          id: "stripe:evt_test_checkout_completed",
          kind: "checkout_completed",
          customer_id: "customer_123",
          offer_id: testOfferIds.proMonthly
        })
        expect(parseJsonColumn(event?.payload).id).toBe("evt_test_checkout_completed")

        const intent = yield* queryOne<{ readonly status: string }>(
          "SELECT status FROM paykit_checkout_intent WHERE provider_checkout_session_id = ?",
          [TEST_CHECKOUT_SESSION_ID]
        )
        expect(intent?.status).toBe("accepted")

        const subscription = yield* queryOne<{ readonly status: string; readonly provider_id: string }>(
          "SELECT status, provider_id FROM paykit_subscription WHERE provider_id = ?",
          [TEST_SUBSCRIPTION_ID]
        )
        expect(subscription).toMatchObject({
          status: "active",
          provider_id: TEST_SUBSCRIPTION_ID
        })

        const entitlement = yield* queryOne<{ readonly feature_id: string }>(
          "SELECT feature_id FROM paykit_entitlement WHERE customer_id = ? AND feature_id = ?",
          [testCustomerId, "premium_access"]
        )
        expect(entitlement?.feature_id).toBe("premium_access")
      }),
      payment.layer
    )
  })

  it.effect("webhook.receive duplicate event returns accepted=false without mutation", () => {
    const payment = makeTestPaymentLayer({ normalizedWebhook: checkoutCompletedNormalization })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* prepareCheckoutWebhook
        yield* sdk.webhooks.handle({
          provider: "stripe",
          body: JSON.stringify({ id: "evt_test_checkout_completed" }),
          signature: "test_signature"
        })
        const before = yield* countCoreRows

        const second = yield* sdk.webhooks.handle({
          provider: "stripe",
          body: JSON.stringify({ id: "evt_test_checkout_completed" }),
          signature: "test_signature"
        })
        const after = yield* countCoreRows

        expect(second.accepted).toBe(false)
        expect(second.normalizedEvents).toHaveLength(0)
        expect(second.reconciliationTriggers).toHaveLength(0)
        expect(after).toEqual(before)
      }),
      payment.layer
    )
  })

  it.effect("webhook.receive writes subscription provider refs for the active provider", () => {
    const payment = makeTestPaymentLayer({
      provider: "paddle",
      normalizedWebhook: checkoutCompletedNormalization
    })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* prepareCheckoutWebhook

        yield* sdk.webhooks.handle({
          provider: "paddle",
          body: '{"id":"evt_test_checkout_completed"}',
          signature: "test_signature"
        })

        const refs = yield* queryAll<{
          readonly provider: string
          readonly owner_type: string
          readonly provider_id: string
          readonly kind: string
        }>(
          `SELECT provider, owner_type, provider_id, kind
           FROM paykit_provider_ref
           WHERE owner_type = 'subscription'
           ORDER BY provider`
        )

        expect(refs).toEqual([
          {
            provider: "paddle",
            owner_type: "subscription",
            provider_id: TEST_SUBSCRIPTION_ID,
            kind: "subscription"
          }
        ])
      }),
      payment.layer
    )
  })

  it.effect("webhooks.replay returns stored normalized event without mutating", () => {
    const payment = makeTestPaymentLayer({ normalizedWebhook: checkoutCompletedNormalization })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* prepareCheckoutWebhook
        yield* sdk.webhooks.handle({
          provider: "stripe",
          body: JSON.stringify({ id: "evt_test_checkout_completed" }),
          signature: "test_signature"
        })
        const before = yield* countCoreRows

        const replay = yield* sdk.webhooks.replay({
          provider: "stripe",
          providerEventId: "evt_test_checkout_completed" as never
        })
        const after = yield* countCoreRows

        expect(replay.accepted).toBe(false)
        expect(replay.normalizedEvents).toHaveLength(1)
        expect(replay.normalizedEvents[0]?.id).toBe("stripe:evt_test_checkout_completed")
        expect(after).toEqual(before)
      }),
      payment.layer
    )
  })

  it.effect("webhook.receive rejects provider that does not match active layer", () => {
    const payment = makeTestPaymentLayer({
      provider: "stripe",
      normalizedWebhook: checkoutCompletedNormalization
    })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* prepareCheckoutWebhook
        const before = yield* countCoreRows

        const result = yield* Effect.either(
          sdk.webhooks.handle({
            provider: "paddle",
            body: JSON.stringify({ id: "evt_wrong_provider" }),
            signature: "test_signature"
          })
        )
        const after = yield* countCoreRows

        expect(Either.isLeft(result)).toBe(true)
        if (Either.isLeft(result)) {
          expect((result.left as { readonly _tag?: string })._tag).toBe("CommercialWebhookRejected")
          expect((result.left as { readonly message?: string }).message).toContain("does not match active pay provider")
        }
        expect(after).toEqual(before)
      }),
      payment.layer
    )
  })
})
