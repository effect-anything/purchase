import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"

import { CommercialCatalogService } from "../../src/core/catalog-service.ts"
import { CustomerCommercialSnapshot } from "../../src/core/commercial-schema.ts"
import {
  buildCustomerCommercialSnapshot,
  buildCustomerEntitlementSnapshot,
  CommercialProjectionService
} from "../../src/core/projection-service.ts"
import { syncCatalog } from "../../src/sync/config-service.ts"
import { runCorePayEffect } from "../support/run-core-pay-effect.ts"
import { queryAll } from "../support/sqlite-pay-harness.ts"
import { testCustomerId, testOfferIds } from "../support/test-catalog.ts"
import { makeTestPaymentLayer } from "../support/test-payment-provider.ts"

describe("core projection service", () => {
  it.effect("builds customer snapshots and merged entitlements from catalog state", () => {
    const payment = makeTestPaymentLayer()

    return runCorePayEffect(
      Effect.gen(function* () {
        const catalogService = yield* CommercialCatalogService
        const catalog = yield* catalogService.getCatalog()
        const snapshot = buildCustomerCommercialSnapshot({
          catalog,
          customerId: testCustomerId,
          subscriptions: [],
          purchases: [],
          wallets: [],
          now: new Date("2025-01-01T00:00:00.000Z")
        })
        const entitlements = buildCustomerEntitlementSnapshot({
          catalog,
          snapshot: CustomerCommercialSnapshot.make({
            ...snapshot,
            activeOfferIds: [testOfferIds.free, testOfferIds.proMonthly] as never
          }),
          now: new Date("2025-01-01T00:00:00.000Z")
        })

        expect(snapshot.activeOfferIds).toEqual([testOfferIds.free])
        expect(entitlements.benefits).toEqual(
          expect.arrayContaining([expect.objectContaining({ type: "feature_flag", key: "premium_access" })])
        )
      }),
      payment.layer
    )
  })

  it.effect("refreshes stored customer state into subscriptions, purchases, wallets and entitlements", () => {
    const payment = makeTestPaymentLayer()

    return runCorePayEffect(
      Effect.gen(function* () {
        const catalogService = yield* CommercialCatalogService
        const projection = yield* CommercialProjectionService
        const now = "2025-01-01T00:00:00.000Z"

        yield* syncCatalog()
        const proRow = yield* queryAll<{ readonly internal_id: string }>(
          "SELECT internal_id FROM paykit_product WHERE id = ? LIMIT 1",
          [testOfferIds.proMonthly]
        )
        yield* queryAll(
          `INSERT INTO paykit_subscription
             (id, customer_id, product_internal_id, provider_id, provider_data, status, canceled, cancel_at_period_end, started_at, current_period_start_at, current_period_end_at, quantity, created_at, updated_at)
           VALUES (?, ?, ?, ?, '{}', 'active', 0, 0, ?, ?, ?, 1, ?, ?)`,
          ["sub_test_123", testCustomerId, proRow[0]?.internal_id ?? "", "sub_provider_123", now, now, now, now, now]
        )
        yield* queryAll(
          `INSERT INTO paykit_invoice
             (id, customer_id, subscription_id, type, status, amount, currency, provider_id, provider_data, created_at, updated_at)
           VALUES (?, ?, NULL, 'one_time', 'paid', 19900, 'usd', 'txn_123', ?, ?, ?)`,
          ["inv_test_123", testCustomerId, JSON.stringify({ offerId: testOfferIds.lifetime }), now, now]
        )
        yield* queryAll(
          `INSERT INTO paykit_credit_ledger
             (id, customer_id, product_id, offer_id, amount, direction, idempotency_key, created_at)
           VALUES
             ('ledger_grant', ?, 'ai_credits', ?, 100, 'grant', 'grant_1', ?),
             ('ledger_consume', ?, 'ai_credits', ?, 40, 'consume', 'consume_1', ?)`,
          [testCustomerId, testOfferIds.credits100, now, testCustomerId, testOfferIds.credits100, now]
        )

        const snapshot = yield* projection.refreshCustomerSnapshot({
          customerId: testCustomerId,
          reason: "manual"
        })
        const entitlements = yield* projection.computeCustomerEntitlements({ customerSnapshot: snapshot })

        expect(snapshot.subscriptions).toHaveLength(1)
        expect(snapshot.purchases).toHaveLength(1)
        expect(snapshot.wallets).toEqual(
          expect.arrayContaining([expect.objectContaining({ productId: "ai_credits", available: 60 })])
        )
        expect(entitlements.benefits).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ type: "feature_flag", key: "premium_access" }),
            expect.objectContaining({ type: "credit_balance", key: "ai_credits", amount: 60 })
          ])
        )
      }),
      payment.layer
    )
  })
})
