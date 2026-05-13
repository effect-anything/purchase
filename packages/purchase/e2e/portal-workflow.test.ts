import * as SqlClient from "@effect/sql/SqlClient"
import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"

import { syncCatalog } from "../src/config.ts"
import { runPayEffect } from "../test/support/run-pay-effect.ts"
import { countRows, insertTestCustomer, parseJsonColumn, queryOne } from "../test/support/sqlite-pay-harness.ts"
import { TestPay, testCustomerId, testOfferIds, testSubscriptionAgreementId } from "../test/support/test-catalog.ts"
import {
  makeTestPaymentLayer,
  TEST_BILLING_PORTAL_SESSION_ID,
  TEST_BILLING_PORTAL_URL,
  TEST_PROVIDER_CUSTOMER_ID,
  TEST_SUBSCRIPTION_ID
} from "../test/support/test-payment-provider.ts"

const seedSubscription = (input?: {
  readonly agreementId?: string | undefined
  readonly customerId?: string | undefined
  readonly providerId?: string | undefined
}) =>
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
        input?.agreementId ?? TEST_SUBSCRIPTION_ID,
        input?.customerId ?? "customer_123",
        freeProduct?.internal_id,
        input?.providerId ?? TEST_SUBSCRIPTION_ID,
        JSON.stringify({ offerId: testOfferIds.free, provider: "stripe" }),
        now,
        now
      ]
    ).withoutTransform
  })

describe("core portal workflow", () => {
  it.effect("portal.createSession ensures provider customer and calls provider", () => {
    const payment = makeTestPaymentLayer()

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* insertTestCustomer({})
        yield* syncCatalog()

        const result = yield* sdk.portal.createSession({
          customerId: testCustomerId,
          flow: "general",
          returnUrl: "https://app.test/account"
        })

        expect(result.provider).toBe("stripe")
        expect(result.id).toBe(TEST_BILLING_PORTAL_SESSION_ID)
        expect(result.providerCustomerId).toBe(TEST_PROVIDER_CUSTOMER_ID)
        expect(result.url).toBe(TEST_BILLING_PORTAL_URL)
        expect(payment.calls.customers.find).toHaveLength(1)
        expect(payment.calls.customers.create).toHaveLength(1)
        expect(payment.calls.billingPortal.createSession).toHaveLength(1)

        const customer = yield* queryOne<{ readonly provider: string }>(
          "SELECT provider FROM paykit_customer WHERE id = ?",
          ["customer_123"]
        )
        expect(parseJsonColumn(customer?.provider).stripe).toBe(TEST_PROVIDER_CUSTOMER_ID)

        const customerRef = yield* queryOne<{ readonly provider_id: string }>(
          `SELECT provider_id
           FROM paykit_provider_ref
           WHERE owner_type = 'customer' AND owner_id = ? AND kind = 'customer'`,
          ["customer_123"]
        )
        expect(customerRef?.provider_id).toBe(TEST_PROVIDER_CUSTOMER_ID)
      }),
      payment.layer
    )
  })

  it.effect("portal.createSession with missing customer fails without provider call", () => {
    const payment = makeTestPaymentLayer()

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* syncCatalog()

        const result = yield* Effect.either(
          sdk.portal.createSession({
            customerId: testCustomerId,
            flow: "general",
            returnUrl: "https://app.test/account"
          })
        )

        expect(Either.isLeft(result)).toBe(true)
        if (Either.isLeft(result)) {
          expect((result.left as { readonly _tag?: string })._tag).toBe("CommercialCustomerNotFound")
        }
        expect(
          yield* queryOne<{ readonly count: number }>(
            `SELECT COUNT(*) AS count
             FROM paykit_provider_ref
             WHERE owner_type = 'customer' AND owner_id = 'customer_123'`
          )
        ).toMatchObject({ count: 0 })
        expect(payment.calls.customers.find).toHaveLength(0)
        expect(payment.calls.customers.create).toHaveLength(0)
        expect(payment.calls.billingPortal.createSession).toHaveLength(0)
      }),
      payment.layer
    )
  })

  it.effect("portal.createSession preserves provider unsupported failure as workflow conflict", () => {
    const payment = makeTestPaymentLayer({
      unsupported: { "billingPortal.createSession": true }
    })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* insertTestCustomer({})
        yield* syncCatalog()

        const result = yield* Effect.either(
          sdk.portal.createSession({
            customerId: testCustomerId,
            flow: "general",
            returnUrl: "https://app.test/account"
          })
        )

        expect(Either.isLeft(result)).toBe(true)
        if (Either.isLeft(result)) {
          expect((result.left as { readonly _tag?: string })._tag).toBe("CommercialWorkflowConflict")
          expect((result.left as { readonly message?: string }).message).toContain("portal.create_session")
        }
        expect(payment.calls.billingPortal.createSession).toHaveLength(1)
        expect(yield* countRows("paykit_checkout_intent")).toBe(0)
        expect(yield* countRows("paykit_invoice")).toBe(0)
        expect(yield* countRows("paykit_subscription")).toBe(0)
        expect(yield* countRows("paykit_credit_ledger")).toBe(0)
      }),
      payment.layer
    )
  })

  it.effect("portal.createSession rejects Stripe subscription flow without agreement before provider call", () => {
    const payment = makeTestPaymentLayer()

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* insertTestCustomer({})
        yield* syncCatalog()

        const result = yield* Effect.either(
          sdk.portal.createSession({
            customerId: testCustomerId,
            flow: "subscription_cancel",
            returnUrl: "https://app.test/account"
          })
        )

        expect(Either.isLeft(result)).toBe(true)
        if (Either.isLeft(result)) {
          expect((result.left as { readonly _tag?: string })._tag).toBe("CommercialWorkflowConflict")
          expect((result.left as { readonly message?: string }).message).toContain("requires agreementId")
        }
        expect(payment.calls.billingPortal.createSession).toHaveLength(0)
      }),
      payment.layer
    )
  })

  it.effect("portal.createSession rejects Paddle subscription_update flow before provider call", () => {
    const payment = makeTestPaymentLayer({ provider: "paddle" })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* insertTestCustomer({})
        yield* syncCatalog()
        yield* seedSubscription()

        const result = yield* Effect.either(
          sdk.portal.createSession({
            customerId: testCustomerId,
            agreementId: testSubscriptionAgreementId,
            flow: "subscription_update",
            returnUrl: "https://app.test/account"
          })
        )

        expect(Either.isLeft(result)).toBe(true)
        if (Either.isLeft(result)) {
          expect((result.left as { readonly _tag?: string })._tag).toBe("CommercialWorkflowConflict")
          expect((result.left as { readonly message?: string }).message).toContain("does not support portal flow")
        }
        expect(payment.calls.billingPortal.createSession).toHaveLength(0)
      }),
      payment.layer
    )
  })

  it.effect("portal.createSession rejects agreement owned by another customer before provider call", () => {
    const payment = makeTestPaymentLayer()

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* insertTestCustomer({})
        yield* insertTestCustomer({ id: "customer_456", email: "john@example.com", name: "John Doe" })
        yield* syncCatalog()
        yield* seedSubscription({
          agreementId: "sub_other_customer",
          customerId: "customer_456",
          providerId: "sub_other_customer_provider"
        })

        const result = yield* Effect.either(
          sdk.portal.createSession({
            customerId: testCustomerId,
            agreementId: "sub_other_customer" as never,
            flow: "subscription_cancel",
            returnUrl: "https://app.test/account"
          })
        )

        expect(Either.isLeft(result)).toBe(true)
        if (Either.isLeft(result)) {
          expect((result.left as { readonly _tag?: string })._tag).toBe("CommercialWorkflowConflict")
          expect((result.left as { readonly message?: string }).message).toContain("does not belong to customer")
        }
        expect(payment.calls.billingPortal.createSession).toHaveLength(0)
      }),
      payment.layer
    )
  })
})
