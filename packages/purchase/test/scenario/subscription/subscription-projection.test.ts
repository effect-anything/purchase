import * as SqlClient from "@effect/sql/SqlClient"
import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"

import { syncCatalog } from "../../../src/sync/config-service.ts"
import { runPayEffect } from "../../../test/support/run-pay-effect.ts"
import { insertTestCustomer, parseJsonColumn, queryOne } from "../../../test/support/sqlite-pay-harness.ts"
import {
  asCommercialOfferId,
  testCustomerId,
  testOfferIds,
  TestPay,
  testSubscriptionAgreementId
} from "../../../test/support/test-catalog.ts"
import {
  makeTestPaymentLayer,
  TEST_CREATED_PRICE_ID,
  TEST_PROVIDER_CUSTOMER_ID,
  TEST_SUBSCRIPTION_ID
} from "../../../test/support/test-payment-provider.ts"

const subscriptionUpdatedNormalization = {
  providerEventId: "evt_test_subscription_updated",
  eventType: "customer.subscription.updated",
  kind: "subscription_updated",
  occurredAt: new Date("2025-01-01T00:00:00.000Z"),
  resource: { id: TEST_SUBSCRIPTION_ID, provider: "stripe" },
  metadata: {
    payCustomerId: "customer_123",
    payOfferId: testOfferIds.proMonthly
  },
  providerCustomerId: TEST_PROVIDER_CUSTOMER_ID,
  providerSubscriptionId: TEST_SUBSCRIPTION_ID,
  providerOfferId: TEST_CREATED_PRICE_ID,
  status: "active",
  currentPeriodStartAt: new Date("2025-01-01T00:00:00.000Z"),
  currentPeriodEndAt: new Date("2025-02-01T00:00:00.000Z"),
  quantity: 1
} as const

const seedCurrentSubscription = Effect.gen(function* () {
  const freeProduct = yield* queryOne<{ readonly internal_id: string }>(
    "SELECT internal_id FROM paykit_product WHERE id = ?",
    [testOfferIds.free]
  )
  const sql = yield* SqlClient.SqlClient
  const now = new Date("2025-01-01T00:00:00.000Z").toISOString()

  yield* sql.unsafe(
    `INSERT INTO paykit_subscription (
        id, customer_id, product_internal_id, provider_id, provider_data, status,
        canceled, cancel_at_period_end, quantity, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'active', 0, 0, 1, ?, ?)`,
    [
      TEST_SUBSCRIPTION_ID,
      "customer_123",
      freeProduct?.internal_id,
      TEST_SUBSCRIPTION_ID,
      JSON.stringify({ offerId: testOfferIds.free, provider: "stripe" }),
      now,
      now
    ]
  ).withoutTransform
})

describe("core subscription projection workflow", () => {
  it.effect("subscription_updated event upserts subscription projection", () => {
    const payment = makeTestPaymentLayer({ normalizedWebhook: subscriptionUpdatedNormalization })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* insertTestCustomer({})
        yield* syncCatalog()

        const result = yield* sdk.webhooks.handle({
          provider: "stripe",
          body: JSON.stringify({ id: "evt_test_subscription_updated" }),
          signature: "test_signature"
        })
        expect(result.accepted).toBe(true)

        const subscription = yield* queryOne<{
          readonly id: string
          readonly customer_id: string
          readonly provider_id: string
          readonly provider_data: string
          readonly status: string
        }>("SELECT * FROM paykit_subscription WHERE id = ?", [TEST_SUBSCRIPTION_ID])

        expect(subscription).toMatchObject({
          id: TEST_SUBSCRIPTION_ID,
          customer_id: "customer_123",
          provider_id: TEST_SUBSCRIPTION_ID,
          status: "active"
        })
        expect(parseJsonColumn(subscription?.provider_data).offerId).toBe(testOfferIds.proMonthly)

        const snapshot = yield* sdk.customer.getSnapshot({ customerId: testCustomerId })
        expect(snapshot.subscriptions.map((item) => item.id)).toContain(TEST_SUBSCRIPTION_ID)

        const entitlements = yield* sdk.customer.getEntitlements({ customerId: testCustomerId })
        expect(entitlements.benefits).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ key: "premium_access" }),
            expect.objectContaining({ key: "monthly_quota", limit: 100 })
          ])
        )
      }),
      payment.layer
    )
  })

  it.effect("subscription cancel/change/pause/resume call provider and return reconciliation", () => {
    const payment = makeTestPaymentLayer()

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* insertTestCustomer({})
        yield* syncCatalog()
        yield* seedCurrentSubscription

        const cancel = yield* sdk.subscriptions.cancel({
          customerId: testCustomerId,
          agreementId: testSubscriptionAgreementId,
          effectiveAt: "period_end"
        })
        const change = yield* sdk.subscriptions.change({
          customerId: testCustomerId,
          agreementId: testSubscriptionAgreementId,
          targetOfferId: asCommercialOfferId(testOfferIds.proMonthly),
          prorationMode: "provider_default"
        })
        const pause = yield* sdk.subscriptions.pause({
          customerId: testCustomerId,
          agreementId: testSubscriptionAgreementId
        })
        const resume = yield* sdk.subscriptions.resume({
          customerId: testCustomerId,
          agreementId: testSubscriptionAgreementId
        })
        const preview = yield* sdk.subscriptions.previewChange({
          customerId: testCustomerId,
          agreementId: testSubscriptionAgreementId,
          targetOfferId: asCommercialOfferId(testOfferIds.proMonthly)
        })

        expect(cancel.workflow).toBe("subscription.cancel")
        expect(change.workflow).toBe("subscription.change")
        expect(pause.workflow).toBe("subscription.pause")
        expect(resume.workflow).toBe("subscription.resume")
        expect(preview.subscriptionId).toBe(TEST_SUBSCRIPTION_ID)
        expect(cancel.reconciliationTriggers[0]?.reason).toBe("subscription_updated")
        expect(change.reconciliationTriggers[0]?.offerId).toBe(testOfferIds.proMonthly)

        expect(payment.calls.subscriptions.cancel).toHaveLength(1)
        expect(payment.calls.subscriptions.change).toHaveLength(1)
        expect(payment.calls.subscriptions.pause).toHaveLength(1)
        expect(payment.calls.subscriptions.resume).toHaveLength(1)
        expect(payment.calls.subscriptions.previewChange).toHaveLength(1)
        expect(payment.calls.subscriptions.change[0]?.providerOfferId).toBe(TEST_CREATED_PRICE_ID)
        expect(payment.calls.subscriptions.pause[0]?.mode).toBe("billing_collection")
        expect(payment.calls.subscriptions.resume[0]?.mode).toBe("billing_collection")

        const subscription = yield* queryOne<{ readonly status: string }>(
          "SELECT status FROM paykit_subscription WHERE id = ?",
          [TEST_SUBSCRIPTION_ID]
        )
        expect(subscription?.status).toBe("active")
      }),
      payment.layer
    )
  })
})
