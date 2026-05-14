import * as SqlClient from "@effect/sql/SqlClient"
import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"

import type { PaymentProviderTag } from "../../src/provider/types.ts"
import { syncCatalog } from "../../src/sync/config-service.ts"
import { runPayEffect } from "../support/run-pay-effect.ts"
import { countCoreRows, insertTestCustomer, queryOne } from "../support/sqlite-pay-harness.ts"
import { testCustomerId, testOfferIds, TestPay, testSubscriptionAgreementId } from "../support/test-catalog.ts"
import { makeTestPaymentLayer, TEST_SUBSCRIPTION_ID } from "../support/test-payment-provider.ts"

const seedSubscription = (provider: PaymentProviderTag) =>
  Effect.gen(function* () {
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
        JSON.stringify({ offerId: testOfferIds.free, provider }),
        now,
        now
      ]
    ).withoutTransform
  })

describe("core unsupported provider operations", () => {
  it.effect("Stripe default pause and resume resolve provider mode internally", () => {
    const payment = makeTestPaymentLayer({
      provider: "stripe"
    })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* insertTestCustomer({})
        yield* syncCatalog()
        yield* seedSubscription("stripe")

        yield* sdk.subscriptions.pause({
          customerId: testCustomerId,
          agreementId: testSubscriptionAgreementId
        })
        yield* sdk.subscriptions.resume({
          customerId: testCustomerId,
          agreementId: testSubscriptionAgreementId
        })

        expect(payment.calls.subscriptions.pause[0]?.mode).toBe("billing_collection")
        expect(payment.calls.subscriptions.pause[0]?.effectiveFrom).toBe("immediately")
        expect(payment.calls.subscriptions.resume[0]?.mode).toBe("billing_collection")
        expect(payment.calls.subscriptions.resume[0]?.effectiveFrom).toBe("immediately")
      }),
      payment.layer
    )
  })

  it.effect("Paddle default pause and resume resolve provider mode internally", () => {
    const payment = makeTestPaymentLayer({
      provider: "paddle"
    })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* insertTestCustomer({})
        yield* syncCatalog()
        yield* seedSubscription("paddle")

        yield* sdk.subscriptions.pause({
          customerId: testCustomerId,
          agreementId: testSubscriptionAgreementId
        })
        yield* sdk.subscriptions.resume({
          customerId: testCustomerId,
          agreementId: testSubscriptionAgreementId
        })

        expect(payment.calls.subscriptions.pause[0]?.mode).toBe("lifecycle")
        expect(payment.calls.subscriptions.pause[0]?.effectiveFrom).toBeUndefined()
        expect(payment.calls.subscriptions.resume[0]?.mode).toBe("lifecycle")
        expect(payment.calls.subscriptions.resume[0]?.effectiveFrom).toBe("immediately")
      }),
      payment.layer
    )
  })

  it.effect("Stripe lifecycle pause is rejected before provider call", () => {
    const payment = makeTestPaymentLayer({
      provider: "stripe"
    })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* insertTestCustomer({})
        yield* syncCatalog()
        yield* seedSubscription("stripe")
        const before = yield* countCoreRows

        const result = yield* Effect.either(
          sdk.subscriptions.pause({
            customerId: testCustomerId,
            agreementId: testSubscriptionAgreementId,
            mode: "lifecycle",
            effectiveAt: "immediately"
          })
        )
        const after = yield* countCoreRows

        expect(Either.isLeft(result)).toBe(true)
        if (Either.isLeft(result)) {
          expect((result.left as { readonly _tag?: string })._tag).toBe("CommercialWorkflowConflict")
          expect((result.left as { readonly message?: string }).message).toContain('mode="billing_collection"')
        }
        expect(payment.calls.subscriptions.pause).toHaveLength(0)
        expect(after).toEqual(before)
      }),
      payment.layer
    )
  })

  it.effect("Stripe lifecycle pause unsupported fails explicitly without mutation", () => {
    const payment = makeTestPaymentLayer({
      provider: "stripe",
      unsupported: { "subscriptions.pause.lifecycle": true }
    })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* insertTestCustomer({})
        yield* syncCatalog()
        yield* seedSubscription("stripe")
        const before = yield* countCoreRows

        const result = yield* Effect.either(
          sdk.subscriptions.pause({
            customerId: testCustomerId,
            agreementId: testSubscriptionAgreementId,
            mode: "lifecycle",
            effectiveAt: "immediately"
          })
        )
        const after = yield* countCoreRows
        const subscription = yield* queryOne<{ readonly status: string }>(
          "SELECT status FROM paykit_subscription WHERE id = ?",
          [TEST_SUBSCRIPTION_ID]
        )

        expect(Either.isLeft(result)).toBe(true)
        if (Either.isLeft(result)) {
          expect(["CommercialWorkflowConflict", "ProviderOperationNotSupported"]).toContain(
            (result.left as { readonly _tag?: string })._tag
          )
        }
        expect(subscription?.status).toBe("active")
        expect(after).toEqual(before)
      }),
      payment.layer
    )
  })

  it.effect("Paddle billing collection resume is rejected before provider call", () => {
    const payment = makeTestPaymentLayer({
      provider: "paddle"
    })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* insertTestCustomer({})
        yield* syncCatalog()
        yield* seedSubscription("paddle")
        const before = yield* countCoreRows

        const result = yield* Effect.either(
          sdk.subscriptions.resume({
            customerId: testCustomerId,
            agreementId: testSubscriptionAgreementId,
            mode: "billing_collection",
            effectiveAt: "immediately"
          })
        )
        const after = yield* countCoreRows

        expect(Either.isLeft(result)).toBe(true)
        if (Either.isLeft(result)) {
          expect((result.left as { readonly _tag?: string })._tag).toBe("CommercialWorkflowConflict")
          expect((result.left as { readonly message?: string }).message).toContain('mode="lifecycle"')
        }
        expect(payment.calls.subscriptions.resume).toHaveLength(0)
        expect(after).toEqual(before)
      }),
      payment.layer
    )
  })

  it.effect("Paddle billing collection pause unsupported fails explicitly without mutation", () => {
    const payment = makeTestPaymentLayer({
      provider: "paddle",
      unsupported: { "subscriptions.pause.billing_collection": true }
    })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* insertTestCustomer({})
        yield* syncCatalog()
        yield* seedSubscription("paddle")
        const before = yield* countCoreRows

        const result = yield* Effect.either(
          sdk.subscriptions.pause({
            customerId: testCustomerId,
            agreementId: testSubscriptionAgreementId,
            mode: "billing_collection",
            effectiveAt: "immediately"
          })
        )
        const after = yield* countCoreRows
        const subscription = yield* queryOne<{ readonly status: string }>(
          "SELECT status FROM paykit_subscription WHERE id = ?",
          [TEST_SUBSCRIPTION_ID]
        )

        expect(Either.isLeft(result)).toBe(true)
        if (Either.isLeft(result)) {
          expect(["CommercialWorkflowConflict", "ProviderOperationNotSupported"]).toContain(
            (result.left as { readonly _tag?: string })._tag
          )
        }
        expect(subscription?.status).toBe("active")
        expect(after).toEqual(before)
      }),
      payment.layer
    )
  })

  it.effect("Stripe lifecycle resume unsupported fails explicitly without mutation", () => {
    const payment = makeTestPaymentLayer({
      provider: "stripe",
      unsupported: { "subscriptions.resume.lifecycle": true }
    })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* insertTestCustomer({})
        yield* syncCatalog()
        yield* seedSubscription("stripe")
        const before = yield* countCoreRows

        const result = yield* Effect.either(
          sdk.subscriptions.resume({
            customerId: testCustomerId,
            agreementId: testSubscriptionAgreementId,
            mode: "lifecycle",
            effectiveAt: "immediately"
          })
        )
        const after = yield* countCoreRows
        const subscription = yield* queryOne<{ readonly status: string }>(
          "SELECT status FROM paykit_subscription WHERE id = ?",
          [TEST_SUBSCRIPTION_ID]
        )

        expect(Either.isLeft(result)).toBe(true)
        if (Either.isLeft(result)) {
          expect(["CommercialWorkflowConflict", "ProviderOperationNotSupported"]).toContain(
            (result.left as { readonly _tag?: string })._tag
          )
        }
        expect(subscription?.status).toBe("active")
        expect(after).toEqual(before)
      }),
      payment.layer
    )
  })

  it.effect("Paddle billing collection resume unsupported fails explicitly without mutation", () => {
    const payment = makeTestPaymentLayer({
      provider: "paddle",
      unsupported: { "subscriptions.resume.billing_collection": true }
    })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* insertTestCustomer({})
        yield* syncCatalog()
        yield* seedSubscription("paddle")
        const before = yield* countCoreRows

        const result = yield* Effect.either(
          sdk.subscriptions.resume({
            customerId: testCustomerId,
            agreementId: testSubscriptionAgreementId,
            mode: "billing_collection",
            effectiveAt: "immediately"
          })
        )
        const after = yield* countCoreRows
        const subscription = yield* queryOne<{ readonly status: string }>(
          "SELECT status FROM paykit_subscription WHERE id = ?",
          [TEST_SUBSCRIPTION_ID]
        )

        expect(Either.isLeft(result)).toBe(true)
        if (Either.isLeft(result)) {
          expect(["CommercialWorkflowConflict", "ProviderOperationNotSupported"]).toContain(
            (result.left as { readonly _tag?: string })._tag
          )
        }
        expect(subscription?.status).toBe("active")
        expect(after).toEqual(before)
      }),
      payment.layer
    )
  })
})
