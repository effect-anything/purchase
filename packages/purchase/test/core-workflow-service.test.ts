import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"

import { CommercialCatalogService } from "../src/core/catalog-service.ts"
import { CommercialWorkflowService } from "../src/core/workflow-service.ts"
import { syncCatalog } from "../src/sync/config-service.ts"
import { runCorePayEffect } from "./support/run-core-pay-effect.ts"
import { insertTestCustomer, queryAll, queryOne } from "./support/sqlite-pay-harness.ts"
import { testCustomerId, testOfferIds } from "./support/test-catalog.ts"
import {
  makeTestPaymentLayer,
  TEST_BILLING_PORTAL_URL,
  TEST_CHECKOUT_SESSION_ID,
  TEST_CHECKOUT_URL
} from "./support/test-payment-provider.ts"

describe("core workflow service", () => {
  it.effect("runs checkout, portal, wallet and webhook workflows against the new pay runtime", () => {
    const payment = makeTestPaymentLayer({
      normalizedWebhook: {
        providerEventId: "evt_checkout_123",
        eventType: "checkout.session.completed",
        kind: "checkout_completed",
        occurredAt: new Date("2025-01-01T00:00:00.000Z"),
        resource: {},
        metadata: {
          payCustomerId: testCustomerId,
          payOfferId: testOfferIds.lifetime
        },
        providerCustomerId: "cus_test_123",
        checkoutSessionId: TEST_CHECKOUT_SESSION_ID,
        providerOfferId: "price_test_created",
        status: "paid",
        amount: 19900,
        currency: "usd"
      }
    })

    return runCorePayEffect(
      Effect.gen(function* () {
        const catalogService = yield* CommercialCatalogService
        const workflow = yield* CommercialWorkflowService
        const now = "2025-01-01T00:00:00.000Z"

        yield* insertTestCustomer({ id: testCustomerId, email: "jane@example.com" })
        yield* syncCatalog()
        const proRow = yield* queryAll<{ readonly internal_id: string }>(
          "SELECT internal_id FROM paykit_product WHERE id = ? LIMIT 1",
          [testOfferIds.proMonthly]
        )

        const checkout = yield* workflow.startCheckout({
          customerId: testCustomerId,
          offerId: testOfferIds.proMonthly as never,
          successUrl: "https://app.test/success",
          cancelUrl: "https://app.test/cancel",
          metadata: { source: "core-workflow-service" }
        })

        yield* queryAll(
          `INSERT INTO paykit_subscription
             (id, customer_id, product_internal_id, provider_id, provider_data, status, started_at, current_period_start_at, current_period_end_at, created_at, updated_at)
           VALUES (?, ?, ?, 'sub_test_123', '{}', 'active', ?, ?, ?, ?, ?)`,
          ["sub_test_123", testCustomerId, proRow[0]?.internal_id ?? "", now, now, now, now, now]
        )

        const preview = yield* workflow.previewSubscriptionChange({
          customerId: testCustomerId,
          agreementId: "sub_test_123" as never,
          targetOfferId: testOfferIds.proMonthly as never
        })
        const pause = yield* workflow.pauseSubscription({
          customerId: testCustomerId,
          agreementId: "sub_test_123" as never
        })
        const resume = yield* workflow.resumeSubscription({
          customerId: testCustomerId,
          agreementId: "sub_test_123" as never
        })

        const grant = yield* workflow.grantCredits({
          customerId: testCustomerId,
          creditKey: "ai_credits",
          offerId: testOfferIds.credits100 as never,
          amount: 100,
          idempotencyKey: "grant_1"
        })
        const consume = yield* workflow.consumeCredits({
          customerId: testCustomerId,
          creditKey: "ai_credits",
          amount: 30,
          idempotencyKey: "consume_1"
        })
        const portal = yield* workflow.createPortalSession({
          customerId: testCustomerId,
          agreementId: "sub_test_123" as never,
          flow: "subscription_update"
        })
        const webhook = yield* workflow.receiveWebhook({
          provider: "stripe",
          body: JSON.stringify({ id: "evt_checkout_123", type: "checkout.session.completed" }),
          signature: "sig_test"
        })
        const replay = yield* workflow.replayWebhook({
          provider: "stripe",
          providerEventId: "evt_checkout_123" as never
        })
        const purchase = yield* workflow.getPurchaseGrant({
          customerId: testCustomerId,
          agreementId: "intent_123"
        })
        const wallet = yield* workflow.getCreditWallet({
          customerId: testCustomerId,
          creditKey: "ai_credits"
        })

        const checkoutIntentRow = yield* queryOne<{ readonly status: string }>(
          `SELECT status FROM paykit_checkout_intent WHERE provider_checkout_session_id = ?`,
          [TEST_CHECKOUT_SESSION_ID]
        )

        expect(checkout.checkoutSessionId).toBe(TEST_CHECKOUT_SESSION_ID)
        expect(checkout.checkoutUrl).toBe(TEST_CHECKOUT_URL)
        expect(preview.subscriptionId).toBe("sub_test_123")
        expect(pause.workflow).toBe("subscription.pause")
        expect(resume.workflow).toBe("subscription.resume")
        expect(grant.available).toBe(100)
        expect(consume.available).toBe(70)
        expect(portal.url).toBe(TEST_BILLING_PORTAL_URL)
        expect(webhook.accepted).toBe(true)
        expect(replay.accepted).toBe(false)
        expect(Option.isNone(purchase)).toBe(true)
        expect(wallet.available).toBe(70)
        expect(checkoutIntentRow?.status).toBe("accepted")
      }),
      payment.layer
    )
  })
})
