import * as SqlClient from "@effect/sql/SqlClient"
import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"
import * as Option from "effect/Option"

import { syncCatalog } from "../src/config.ts"
import { runPayEffect } from "../test/support/run-pay-effect.ts"
import {
  countCoreRows,
  countRows,
  insertTestCustomer,
  parseJsonColumn,
  queryAll,
  queryOne
} from "../test/support/sqlite-pay-harness.ts"
import { TestPay, testCustomerId, testOfferIds } from "../test/support/test-catalog.ts"
import {
  makeTestPaymentLayer,
  TEST_CREATED_PRICE_ID,
  TEST_PROVIDER_CUSTOMER_ID,
  TEST_REFUND_ID
} from "../test/support/test-payment-provider.ts"

const lifetimeTransactionId = "txn_lifetime_123"

const seedInvoice = (input?: {
  readonly type?: string | undefined
  readonly status?: string | undefined
  readonly providerData?: Readonly<Record<string, unknown>> | undefined
}) =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient
    const now = new Date("2025-01-01T00:00:00.000Z").toISOString()

    yield* sql.unsafe(
      `INSERT INTO paykit_invoice (
          id, customer_id, type, status, amount, currency, provider_id, provider_data, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 19900, 'usd', ?, ?, ?, ?)`,
      [
        lifetimeTransactionId,
        "customer_123",
        input?.type ?? "one_time",
        input?.status ?? "paid",
        lifetimeTransactionId,
        JSON.stringify(input?.providerData ?? { offerId: testOfferIds.lifetime }),
        now,
        now
      ]
    ).withoutTransform
  })

const setupRefundWorkflow = (input?: Parameters<typeof seedInvoice>[0]) =>
  Effect.gen(function* () {
    const sdk = yield* TestPay
    yield* insertTestCustomer({})
    yield* syncCatalog()
    yield* seedInvoice(input)
    return sdk
  })

const refundUpdatedNormalization = {
  providerEventId: "evt_test_refund_updated",
  eventType: "charge.refunded",
  kind: "refund_updated",
  occurredAt: new Date("2025-01-01T00:00:00.000Z"),
  resource: { id: "re_test_123", transaction: lifetimeTransactionId },
  metadata: {
    payCustomerId: "customer_123",
    payOfferId: testOfferIds.lifetime
  },
  providerCustomerId: TEST_PROVIDER_CUSTOMER_ID,
  providerTransactionId: lifetimeTransactionId,
  providerOfferId: TEST_CREATED_PRICE_ID,
  status: "succeeded",
  amount: 19900,
  currency: "usd"
} as const

describe("core purchase refund workflow", () => {
  it.effect("purchase.refund refunds one-time purchase and recomputes entitlements", () => {
    const payment = makeTestPaymentLayer()

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* setupRefundWorkflow()

        const receipt = yield* sdk.purchases.refund({
          customerId: testCustomerId,
          agreementId: lifetimeTransactionId as never,
          amount: 5000,
          reason: "requested_by_customer"
        })

        expect(receipt.workflow).toBe("purchase.refund")
        expect(receipt.stages).toEqual(
          expect.arrayContaining(["call_provider", "persist_fact", "recompute_entitlements"])
        )
        expect(payment.calls.refunds.create).toHaveLength(1)
        expect(payment.calls.refunds.create[0]).toMatchObject({
          transactionId: lifetimeTransactionId,
          amount: "5000"
        })

        const invoice = yield* queryOne<{ readonly status: string; readonly provider_data: string }>(
          "SELECT status, provider_data FROM paykit_invoice WHERE id = ?",
          [lifetimeTransactionId]
        )
        expect(invoice?.status).toBe("refunded")
        const providerData = parseJsonColumn(invoice?.provider_data)
        expect(parseJsonColumn(providerData.latestRefund).id).toBe(TEST_REFUND_ID)
        expect(parseJsonColumn(providerData.latestRefund).reason).toBe("requested_by_customer")

        const grant = yield* sdk.purchases.getGrant({
          customerId: testCustomerId,
          agreementId: lifetimeTransactionId
        })
        expect(Option.isSome(grant)).toBe(true)
        if (Option.isSome(grant)) {
          expect(grant.value.status).toBe("refunded")
        }

        const entitlements = yield* sdk.customer.getEntitlements({ customerId: testCustomerId })
        expect(entitlements.benefits).not.toEqual(
          expect.arrayContaining([expect.objectContaining({ key: "premium_access" })])
        )
      }),
      payment.layer
    )
  })

  it.effect("purchase.refund rejects non one-time invoice", () => {
    const payment = makeTestPaymentLayer()

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* setupRefundWorkflow({ type: "subscription" })

        const result = yield* Effect.either(
          sdk.purchases.refund({
            customerId: testCustomerId,
            agreementId: lifetimeTransactionId as never
          })
        )
        const invoice = yield* queryOne<{ readonly status: string }>("SELECT status FROM paykit_invoice WHERE id = ?", [
          lifetimeTransactionId
        ])

        expect(Either.isLeft(result)).toBe(true)
        if (Either.isLeft(result)) {
          expect((result.left as { readonly _tag?: string })._tag).toBe("CommercialWorkflowConflict")
        }
        expect(payment.calls.refunds.create).toHaveLength(0)
        expect(invoice?.status).toBe("paid")
      }),
      payment.layer
    )
  })

  it.effect("purchase.refund rejects already refunded invoice", () => {
    const payment = makeTestPaymentLayer()

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* setupRefundWorkflow({ status: "refunded" })

        const result = yield* Effect.either(
          sdk.purchases.refund({
            customerId: testCustomerId,
            agreementId: lifetimeTransactionId as never
          })
        )

        expect(Either.isLeft(result)).toBe(true)
        if (Either.isLeft(result)) {
          expect((result.left as { readonly _tag?: string })._tag).toBe("CommercialWorkflowConflict")
          expect((result.left as { readonly message?: string }).message).toContain("already refunded")
        }
        expect(payment.calls.refunds.create).toHaveLength(0)
      }),
      payment.layer
    )
  })

  it.effect("purchase.refund provider failure does not mutate invoice", () => {
    const payment = makeTestPaymentLayer({
      unsupported: { "refunds.create": true }
    })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* setupRefundWorkflow()

        const result = yield* Effect.either(
          sdk.purchases.refund({
            customerId: testCustomerId,
            agreementId: lifetimeTransactionId as never,
            amount: 5000
          })
        )
        const invoice = yield* queryOne<{ readonly status: string; readonly provider_data: string }>(
          "SELECT status, provider_data FROM paykit_invoice WHERE id = ?",
          [lifetimeTransactionId]
        )

        expect(Either.isLeft(result)).toBe(true)
        if (Either.isLeft(result)) {
          expect((result.left as { readonly _tag?: string })._tag).toBe("CommercialWorkflowConflict")
        }
        expect(payment.calls.refunds.create).toHaveLength(1)
        expect(invoice?.status).toBe("paid")
        expect(parseJsonColumn(invoice?.provider_data).latestRefund).toBeUndefined()
      }),
      payment.layer
    )
  })

  it.effect("refund_updated webhook updates invoice projection without duplicating purchase grant", () => {
    const payment = makeTestPaymentLayer({ normalizedWebhook: refundUpdatedNormalization })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* setupRefundWorkflow()
        const beforeGrant = yield* sdk.purchases.getGrant({
          customerId: testCustomerId,
          agreementId: lifetimeTransactionId
        })
        expect(Option.isSome(beforeGrant)).toBe(true)

        const result = yield* sdk.webhooks.handle({
          provider: "stripe",
          body: JSON.stringify({ id: "evt_test_refund_updated" }),
          signature: "test_signature"
        })

        expect(result.accepted).toBe(true)
        expect(result.normalizedEvents[0]?.kind).toBe("refund_updated")

        const event = yield* queryOne<{ readonly kind: string }>(
          "SELECT kind FROM paykit_commercial_event WHERE provider_event_id = ?",
          ["evt_test_refund_updated"]
        )
        expect(event?.kind).toBe("refund_updated")

        const invoice = yield* queryOne<{ readonly status: string }>("SELECT status FROM paykit_invoice WHERE id = ?", [
          lifetimeTransactionId
        ])
        expect(invoice?.status).toBe("refunded")
        expect(yield* countRows("paykit_invoice")).toBe(1)

        const grant = yield* sdk.purchases.getGrant({
          customerId: testCustomerId,
          agreementId: lifetimeTransactionId
        })
        expect(Option.isSome(grant)).toBe(true)
        if (Option.isSome(grant)) {
          expect(grant.value.status).toBe("refunded")
        }
        expect(
          yield* queryAll("SELECT * FROM paykit_entitlement WHERE customer_id = ? AND feature_id = ?", [
            "customer_123",
            "premium_access"
          ])
        ).toHaveLength(0)

        const beforeReplay = yield* countCoreRows
        const replay = yield* sdk.webhooks.replay({
          provider: "stripe",
          providerEventId: "evt_test_refund_updated" as never
        })
        const afterReplay = yield* countCoreRows

        expect(replay.accepted).toBe(false)
        expect(afterReplay).toEqual(beforeReplay)
      }),
      payment.layer
    )
  })
})
