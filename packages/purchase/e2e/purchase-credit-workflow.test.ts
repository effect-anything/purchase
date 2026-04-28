import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"
import * as Option from "effect/Option"

import { runPayEffect } from "../test/support/run-pay-effect.ts"
import {
  countRows,
  insertTestCustomer,
  parseJsonColumn,
  queryAll,
  queryOne
} from "../test/support/sqlite-pay-harness.ts"
import {
  TestPay,
  asCommercialOfferId,
  testCustomerId,
  testManualEventId,
  testOfferIds
} from "../test/support/test-catalog.ts"
import {
  makeTestPaymentLayer,
  TEST_CREATED_PRICE_ID,
  TEST_PROVIDER_CUSTOMER_ID
} from "../test/support/test-payment-provider.ts"

const lifetimePaidNormalization = {
  providerEventId: "evt_test_lifetime_paid",
  eventType: "transaction.paid",
  kind: "transaction_updated",
  occurredAt: new Date("2025-01-01T00:00:00.000Z"),
  resource: { id: "txn_lifetime_123" },
  metadata: {
    payCustomerId: "customer_123",
    payOfferId: testOfferIds.lifetime
  },
  providerCustomerId: TEST_PROVIDER_CUSTOMER_ID,
  providerTransactionId: "txn_lifetime_123",
  providerOfferId: TEST_CREATED_PRICE_ID,
  status: "paid",
  amount: 19900,
  currency: "usd",
  description: "Lifetime",
  hostedUrl: "https://invoice.test/txn_lifetime_123"
} as const

const creditsPaidNormalization = {
  providerEventId: "evt_test_credits_paid",
  eventType: "transaction.paid",
  kind: "transaction_updated",
  occurredAt: new Date("2025-01-01T00:00:00.000Z"),
  resource: { id: "txn_credits_123" },
  metadata: {
    payCustomerId: "customer_123",
    payOfferId: testOfferIds.credits100
  },
  providerCustomerId: TEST_PROVIDER_CUSTOMER_ID,
  providerTransactionId: "txn_credits_123",
  providerOfferId: TEST_CREATED_PRICE_ID,
  status: "paid",
  amount: 1000,
  currency: "usd"
} as const

const subscriptionPaidNormalization = {
  providerEventId: "evt_test_subscription_paid",
  eventType: "invoice.paid",
  kind: "transaction_updated",
  occurredAt: new Date("2025-01-01T00:00:00.000Z"),
  resource: { id: "in_subscription_123" },
  metadata: {
    payCustomerId: "customer_123",
    payOfferId: testOfferIds.proMonthly
  },
  providerCustomerId: TEST_PROVIDER_CUSTOMER_ID,
  providerTransactionId: "in_subscription_123",
  providerInvoiceId: "in_subscription_123",
  providerOfferId: TEST_CREATED_PRICE_ID,
  status: "paid",
  amount: 2000,
  currency: "usd"
} as const

describe("core purchase and credit workflows", () => {
  it.effect("transaction paid event creates one-time purchase grant", () => {
    const payment = makeTestPaymentLayer({ normalizedWebhook: lifetimePaidNormalization })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* insertTestCustomer({})
        yield* sdk.catalog.sync()

        const result = yield* sdk.webhooks.handle({
          provider: "stripe",
          body: JSON.stringify({ id: "evt_test_lifetime_paid" }),
          signature: "test_signature"
        })
        expect(result.accepted).toBe(true)

        const invoice = yield* queryOne<{
          readonly id: string
          readonly type: string
          readonly status: string
          readonly provider_id: string
          readonly provider_data: string
        }>("SELECT * FROM paykit_invoice WHERE id = ?", ["txn_lifetime_123"])
        expect(invoice).toMatchObject({
          id: "txn_lifetime_123",
          type: "one_time",
          status: "paid",
          provider_id: "txn_lifetime_123"
        })
        expect(parseJsonColumn(invoice?.provider_data).offerId).toBe(testOfferIds.lifetime)

        const grant = yield* sdk.purchases.getGrant({
          customerId: testCustomerId,
          agreementId: "txn_lifetime_123"
        })
        expect(Option.isSome(grant)).toBe(true)
        if (Option.isSome(grant)) {
          expect(grant.value.status).toBe("active")
          expect(grant.value.offerId).toBe(testOfferIds.lifetime)
        }

        const entitlements = yield* sdk.customer.getEntitlements({ customerId: testCustomerId })
        expect(entitlements.benefits).toEqual(
          expect.arrayContaining([expect.objectContaining({ key: "premium_access" })])
        )
      }),
      payment.layer
    )
  })

  it.effect("credits grant, consume, insufficient balance", () => {
    const payment = makeTestPaymentLayer()

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* insertTestCustomer({})

        const granted = yield* sdk.credits.grant({
          customerId: testCustomerId,
          creditKey: "ai_credits",
          offerId: asCommercialOfferId(testOfferIds.credits100),
          amount: 100,
          sourceEventId: testManualEventId,
          idempotencyKey: "grant_1"
        })
        expect(granted.available).toBe(100)
        expect(granted.acquired).toBe(100)
        expect(granted.consumed).toBe(0)

        const duplicate = yield* sdk.credits.grant({
          customerId: testCustomerId,
          creditKey: "ai_credits",
          offerId: asCommercialOfferId(testOfferIds.credits100),
          amount: 100,
          sourceEventId: testManualEventId,
          idempotencyKey: "grant_1"
        })
        expect(duplicate.available).toBe(100)
        expect(yield* countRows("paykit_credit_ledger")).toBe(1)

        const consumed = yield* sdk.credits.consume({
          customerId: testCustomerId,
          creditKey: "ai_credits",
          amount: 40,
          idempotencyKey: "consume_1"
        })
        expect(consumed.available).toBe(60)
        expect(consumed.consumed).toBe(40)

        const failed = yield* Effect.either(
          sdk.credits.consume({
            customerId: testCustomerId,
            creditKey: "ai_credits",
            amount: 1000,
            idempotencyKey: "consume_2"
          })
        )
        expect(Either.isLeft(failed)).toBe(true)
        if (Either.isLeft(failed)) {
          expect((failed.left as { readonly _tag?: string; readonly message?: string })._tag).toBe(
            "CommercialWorkflowConflict"
          )
          expect((failed.left as { readonly message?: string }).message).toContain("Insufficient credits")
        }
        expect(yield* countRows("paykit_credit_ledger")).toBe(2)
      }),
      payment.layer
    )
  })

  it.effect("credit pack transaction paid webhook grants credits idempotently", () => {
    const payment = makeTestPaymentLayer({ normalizedWebhook: creditsPaidNormalization })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* insertTestCustomer({})
        yield* sdk.catalog.sync()

        const first = yield* sdk.webhooks.handle({
          provider: "stripe",
          body: JSON.stringify({ id: "evt_test_credits_paid" }),
          signature: "test_signature"
        })
        expect(first.accepted).toBe(true)

        const invoice = yield* queryOne<{
          readonly id: string
          readonly type: string
          readonly status: string
          readonly provider_id: string
          readonly provider_data: string
        }>("SELECT * FROM paykit_invoice WHERE id = ?", ["txn_credits_123"])
        expect(invoice).toMatchObject({
          id: "txn_credits_123",
          type: "credits",
          status: "paid",
          provider_id: "txn_credits_123"
        })
        expect(parseJsonColumn(invoice?.provider_data).offerId).toBe(testOfferIds.credits100)

        const ledger = yield* queryAll<{
          readonly product_id: string
          readonly offer_id: string
          readonly amount: number
          readonly direction: string
          readonly idempotency_key: string
        }>("SELECT * FROM paykit_credit_ledger ORDER BY created_at")
        expect(ledger).toHaveLength(1)
        expect(ledger[0]).toMatchObject({
          product_id: "ai_credits",
          offer_id: testOfferIds.credits100,
          amount: 100,
          direction: "grant",
          idempotency_key: "stripe:evt_test_credits_paid:credits:ai_credits"
        })

        const wallet = yield* sdk.credits.getWallet({
          customerId: testCustomerId,
          creditKey: "ai_credits"
        })
        expect(wallet.available).toBe(100)

        const entitlements = yield* sdk.customer.getEntitlements({ customerId: testCustomerId })
        expect(entitlements.benefits).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: "credit_balance",
              key: "ai_credits",
              amount: 100
            })
          ])
        )

        const second = yield* sdk.webhooks.handle({
          provider: "stripe",
          body: JSON.stringify({ id: "evt_test_credits_paid" }),
          signature: "test_signature"
        })
        expect(second.accepted).toBe(false)
        expect(yield* countRows("paykit_credit_ledger")).toBe(1)
        const walletAfterDuplicate = yield* sdk.credits.getWallet({
          customerId: testCustomerId,
          creditKey: "ai_credits"
        })
        expect(walletAfterDuplicate.available).toBe(100)
      }),
      payment.layer
    )
  })

  it.effect("subscription recurring credits and credit packs aggregate into one credit wallet", () => {
    let webhook = subscriptionPaidNormalization as
      | typeof subscriptionPaidNormalization
      | typeof creditsPaidNormalization
    const payment = makeTestPaymentLayer({ normalizeWebhook: () => Effect.succeed(webhook) })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* insertTestCustomer({})
        yield* sdk.catalog.sync()

        yield* sdk.webhooks.handle({
          provider: "stripe",
          body: JSON.stringify({ id: "evt_test_subscription_paid" }),
          signature: "test_signature"
        })

        webhook = creditsPaidNormalization
        yield* sdk.webhooks.handle({
          provider: "stripe",
          body: JSON.stringify({ id: "evt_test_credits_paid" }),
          signature: "test_signature"
        })

        const wallet = yield* sdk.credits.getWallet({
          customerId: testCustomerId,
          creditKey: "ai_credits"
        })
        expect(wallet.available).toBe(110)
        expect(wallet.acquired).toBe(110)

        const ledger = yield* queryAll<{
          readonly product_id: string
          readonly offer_id: string
          readonly amount: number
          readonly direction: string
        }>("SELECT product_id, offer_id, amount, direction FROM paykit_credit_ledger ORDER BY amount")
        expect(ledger).toEqual([
          {
            product_id: "ai_credits",
            offer_id: testOfferIds.proMonthly,
            amount: 10,
            direction: "grant"
          },
          {
            product_id: "ai_credits",
            offer_id: testOfferIds.credits100,
            amount: 100,
            direction: "grant"
          }
        ])
      }),
      payment.layer
    )
  })
})
