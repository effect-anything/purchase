import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"

import { syncCatalog } from "../../../src/sync/config-service.ts"
import { runPayEffect } from "../../../test/support/run-pay-effect.ts"
import {
  countCoreRows,
  countRows,
  insertTestCustomer,
  parseJsonColumn,
  queryAll,
  queryOne
} from "../../../test/support/sqlite-pay-harness.ts"
import { testCustomerId, testOfferIds, TestPay } from "../../../test/support/test-catalog.ts"
import {
  makeTestPaymentLayer,
  TEST_CHECKOUT_SESSION_ID,
  TEST_CREATED_PRICE_ID,
  TEST_PROVIDER_CUSTOMER_ID,
  TEST_SUBSCRIPTION_ID
} from "../../../test/support/test-payment-provider.ts"

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
  yield* syncCatalog()
  yield* sdk.checkout.start({
    customerId: testCustomerId,
    offerId: testOfferIds.proMonthly,
    successUrl: "https://app.test/success",
    cancelUrl: "https://app.test/cancel"
  })

  return sdk
})

describe("core webhook workflow", () => {
  // Business contract:
  // a completed checkout should become durable app-readable paid state after webhook reconciliation.
  it.effect("accepts a completed checkout and makes the paid state queryable through snapshot and entitlements", () => {
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
        expect(result.reconciliationTriggers).toContainEqual(
          expect.objectContaining({
            reason: "checkout_completed",
            customerId: "customer_123",
            offerId: testOfferIds.proMonthly,
            sourceEventId: "stripe:evt_test_checkout_completed"
          })
        )

        const receipt = yield* queryOne<{
          readonly provider_event_id: string
          readonly status: string
          readonly processed_at: string | null
        }>("SELECT provider_event_id, status, processed_at FROM paykit_webhook_event WHERE provider_event_id = ?", [
          "evt_test_checkout_completed"
        ])
        expect(receipt).toMatchObject({
          provider_event_id: "evt_test_checkout_completed",
          status: "processed"
        })
        expect(receipt?.processed_at).toBeTruthy()

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
        expect(yield* countRows("paykit_webhook_event")).toBe(1)
        expect(yield* countRows("paykit_commercial_event")).toBe(1)
        expect(yield* countRows("paykit_subscription")).toBe(1)
        expect(yield* countRows("paykit_entitlement")).toBeGreaterThan(0)
      }),
      payment.layer
    )
  })

  // Business contract:
  // duplicate delivery must not duplicate subscriptions, grants, credits, or entitlements.
  it.effect("drops duplicate delivery without mutating durable commercial state", () => {
    const payment = makeTestPaymentLayer({ normalizedWebhook: checkoutCompletedNormalization })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* prepareCheckoutWebhook
        const first = yield* sdk.webhooks.handle({
          provider: "stripe",
          body: JSON.stringify({ id: "evt_test_checkout_completed" }),
          signature: "test_signature"
        })
        expect(first.accepted).toBe(true)
        expect(first.normalizedEvents).toHaveLength(1)
        expect(first.reconciliationTriggers.map((trigger) => trigger.reason)).toContain("checkout_completed")

        const before = yield* countCoreRows

        const second = yield* sdk.webhooks.handle({
          provider: "stripe",
          body: JSON.stringify({ id: "evt_test_checkout_completed" }),
          signature: "test_signature"
        })
        const after = yield* countCoreRows

        expect(second).toMatchObject({
          workflow: "webhook.receive",
          eventId: "stripe:evt_test_checkout_completed",
          providerEventId: "evt_test_checkout_completed",
          accepted: false,
          normalizedEvents: [],
          reconciliationTriggers: []
        })
        expect(after).toEqual(before)
        expect(yield* countRows("paykit_webhook_event")).toBe(1)
        expect(yield* countRows("paykit_commercial_event")).toBe(1)
        expect(yield* countRows("paykit_subscription")).toBe(1)
        expect(yield* countRows("paykit_entitlement")).toBeGreaterThan(0)
      }),
      payment.layer
    )
  })

  // Internal note:
  // this is closer to a provider-ref persistence invariant than to a business scenario.
  // keep it for now, but it likely belongs in a narrower workflow-store/provider-ref test later.
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
        expect(replay.providerEventId).toBe("evt_test_checkout_completed")
        expect(replay.normalizedEvents).toHaveLength(1)
        expect(replay.normalizedEvents[0]).toMatchObject({
          id: "stripe:evt_test_checkout_completed",
          provider: "stripe",
          providerEventId: "evt_test_checkout_completed",
          kind: "checkout_completed",
          customerId: "customer_123",
          offerId: testOfferIds.proMonthly
        })
        expect(replay.reconciliationTriggers).toContainEqual(
          expect.objectContaining({
            reason: "checkout_completed",
            customerId: "customer_123",
            offerId: testOfferIds.proMonthly,
            sourceEventId: "stripe:evt_test_checkout_completed"
          })
        )
        expect(after).toEqual(before)
        expect(yield* countRows("paykit_webhook_event")).toBe(1)
        expect(yield* countRows("paykit_commercial_event")).toBe(1)
        expect(yield* countRows("paykit_subscription")).toBe(1)
        expect(yield* countRows("paykit_entitlement")).toBeGreaterThan(0)
      }),
      payment.layer
    )
  })

  // Recovery gap:
  // current replay is read-only and duplicate delivery short-circuits failed receipts.
  // this scenario should become the deciding regression test when a real recovery mechanism is introduced.
  it.todo("documents current failed-webhook recovery gap when a receipt was stored but projection did not complete")

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
