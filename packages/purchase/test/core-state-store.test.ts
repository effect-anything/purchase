import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"

import { CommercialStateStore } from "../src/core/state-store.ts"
import { runCorePayEffect } from "./support/run-core-pay-effect.ts"
import { queryAll } from "./support/sqlite-pay-harness.ts"
import { testCustomerId, testOfferIds } from "./support/test-catalog.ts"
import { makeTestPaymentLayer } from "./support/test-payment-provider.ts"

describe("core state store", () => {
  it.effect("maps storage rows into subscription, purchase and wallet state", () => {
    const payment = makeTestPaymentLayer()

    return runCorePayEffect(
      Effect.gen(function* () {
        const store = yield* CommercialStateStore
        const now = "2025-01-01T00:00:00.000Z"

        yield* queryAll(
          `INSERT INTO paykit_product
             (internal_id, id, version, name, "group", is_default, price_amount, price_interval, hash, provider, created_at, updated_at)
           VALUES
             ('internal_sub', ?, 1, 'Pro Monthly', 'main', 0, 20, 'month', 'hash_sub', '{}', ?, ?),
             ('internal_lifetime', ?, 1, 'Lifetime', 'default', 0, 199, 'one_time', 'hash_life', '{}', ?, ?)`,
          [testOfferIds.proMonthly, now, now, testOfferIds.lifetime, now, now]
        )
        yield* queryAll(
          `INSERT INTO paykit_subscription
             (id, customer_id, product_internal_id, provider_id, provider_data, status, cancel_at_period_end, started_at, current_period_start_at, current_period_end_at, created_at, updated_at)
           VALUES (?, ?, 'internal_sub', 'sub_provider_123', '{}', 'active', 1, ?, ?, ?, ?, ?)`,
          ["sub_test_123", testCustomerId, now, now, now, now, now]
        )
        yield* queryAll(
          `INSERT INTO paykit_invoice
             (id, customer_id, subscription_id, type, status, amount, currency, provider_id, provider_data, created_at, updated_at)
           VALUES (?, ?, NULL, 'one_time', 'paid', 19900, 'usd', 'txn_123', ?, ?, ?)`,
          ["inv_test_123", testCustomerId, JSON.stringify({ offerId: testOfferIds.lifetime }), now, now]
        )
        yield* queryAll(
          `INSERT INTO paykit_webhook_event
             (id, provider_id, provider_event_id, type, payload, status, received_at, processed_at)
           VALUES (?, 'stripe', 'evt_123', 'transaction.completed', ?, 'processed', ?, ?)`,
          [
            "stripe:evt_123",
            JSON.stringify({ payCustomerId: testCustomerId, payOfferId: testOfferIds.lifetime }),
            now,
            now
          ]
        )
        yield* queryAll(
          `INSERT INTO paykit_credit_ledger
             (id, customer_id, product_id, offer_id, amount, direction, idempotency_key, created_at)
           VALUES
             ('ledger_grant', ?, 'ai_credits', ?, 100, 'grant', 'grant_1', ?),
             ('ledger_refund', ?, 'ai_credits', ?, 20, 'refund', 'refund_1', ?)`,
          [testCustomerId, testOfferIds.credits100, now, testCustomerId, testOfferIds.credits100, now]
        )

        const agreement = yield* store.getSubscriptionAgreement({ agreementId: "sub_test_123" })
        const subscriptions = yield* store.listSubscriptions({ customerId: testCustomerId })
        const purchases = yield* store.listPurchases({ customerId: testCustomerId })
        const wallets = yield* store.listWallets({ customerId: testCustomerId })

        expect(Option.getOrUndefined(agreement)?.offerId).toBe(testOfferIds.proMonthly)
        expect(subscriptions[0]?.cancelAtPeriodEnd).toBe(true)
        expect(purchases[0]?.offerId).toBe(testOfferIds.lifetime)
        expect(wallets).toEqual(
          expect.arrayContaining([expect.objectContaining({ productId: "ai_credits", available: 80, refunded: 20 })])
        )
      }),
      payment.layer
    )
  })
})
