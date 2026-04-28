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
import { TestPay, testCustomerId, testOfferIds } from "../test/support/test-catalog.ts"
import {
  makeTestPaymentLayer,
  TEST_CHECKOUT_SESSION_ID,
  TEST_CHECKOUT_URL,
  TEST_CREATED_PRICE_ID,
  TEST_PROVIDER_CUSTOMER_ID
} from "../test/support/test-payment-provider.ts"

describe("core checkout workflow", () => {
  it.effect("checkout.start persists checkout intent and provider refs", () => {
    const payment = makeTestPaymentLayer()

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* insertTestCustomer({})
        yield* sdk.catalog.sync()

        const result = yield* sdk.checkout.start({
          customerId: testCustomerId,
          offerId: testOfferIds.proMonthly,
          successUrl: "https://app.test/success",
          cancelUrl: "https://app.test/cancel",
          metadata: { workspaceId: "workspace_123" }
        })

        expect(result.provider).toBe("stripe")
        expect(result.customerId).toBe("customer_123")
        expect(result.offerId).toBe(testOfferIds.proMonthly)
        expect(result.session.id).toBe(TEST_CHECKOUT_SESSION_ID)
        expect(result.session.url).toBe(TEST_CHECKOUT_URL)
        expect(result.intentId.length).toBeGreaterThan(0)
        expect(result.metadata.workspaceId).toBe("workspace_123")
        expect(result.metadata.payCustomerId).toBe("customer_123")
        expect(result.metadata.payOfferId).toBe(testOfferIds.proMonthly)

        const intent = yield* queryOne<{
          readonly customer_id: string
          readonly offer_id: string
          readonly provider_checkout_session_id: string
          readonly status: string
          readonly metadata: string
        }>("SELECT * FROM paykit_checkout_intent WHERE id = ?", [result.intentId])
        expect(intent?.customer_id).toBe("customer_123")
        expect(intent?.offer_id).toBe(testOfferIds.proMonthly)
        expect(intent?.provider_checkout_session_id).toBe(TEST_CHECKOUT_SESSION_ID)
        expect(intent?.status).toBe("pending")
        expect(parseJsonColumn(intent?.metadata)).toMatchObject({
          workspaceId: "workspace_123",
          payCustomerId: "customer_123",
          payOfferId: testOfferIds.proMonthly
        })

        const refs = yield* queryAll<{
          readonly owner_type: string
          readonly owner_id: string
          readonly provider_id: string
          readonly kind: string
        }>("SELECT owner_type, owner_id, provider_id, kind FROM paykit_provider_ref ORDER BY owner_type, owner_id")
        expect(refs).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              owner_type: "customer",
              owner_id: "customer_123",
              provider_id: TEST_PROVIDER_CUSTOMER_ID,
              kind: "customer"
            }),
            expect.objectContaining({
              owner_type: "offer",
              owner_id: testOfferIds.proMonthly,
              kind: "offer"
            }),
            expect.objectContaining({
              owner_type: "product",
              owner_id: "saas",
              kind: "product"
            })
          ])
        )

        const readIntent = yield* sdk.checkout.getIntent({ intentId: result.intentId })
        expect(Option.isSome(readIntent)).toBe(true)
        expect(payment.calls.customers.find).toHaveLength(1)
        expect(payment.calls.checkout.prepare).toHaveLength(1)
        expect(payment.calls.checkout.prepare[0]?.providerOfferId).toBe(TEST_CREATED_PRICE_ID)
      }),
      payment.layer
    )
  })

  it.effect("checkout.start fails when customer profile is missing", () => {
    const payment = makeTestPaymentLayer()

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* sdk.catalog.sync()

        const result = yield* Effect.either(
          sdk.checkout.start({
            customerId: testCustomerId,
            offerId: testOfferIds.proMonthly,
            successUrl: "https://app.test/success",
            cancelUrl: "https://app.test/cancel"
          })
        )

        expect(Either.isLeft(result)).toBe(true)
        if (Either.isLeft(result)) {
          expect((result.left as { readonly _tag?: string })._tag).toBe("CommercialCustomerNotFound")
        }
        expect(yield* countRows("paykit_checkout_intent")).toBe(0)
        expect(
          yield* queryAll(
            `SELECT * FROM paykit_provider_ref
             WHERE owner_type = 'customer' AND owner_id = 'customer_123'`
          )
        ).toHaveLength(0)
        expect(payment.calls.customers.find).toHaveLength(0)
        expect(payment.calls.checkout.prepare).toHaveLength(0)
      }),
      payment.layer
    )
  })

  it.effect("checkout.start provider failure returns workflow conflict without persisting intent", () => {
    const payment = makeTestPaymentLayer({
      unsupported: { "checkout.prepare": true }
    })

    return runPayEffect(
      Effect.gen(function* () {
        const sdk = yield* TestPay
        yield* insertTestCustomer({})
        yield* sdk.catalog.sync()

        const result = yield* Effect.either(
          sdk.checkout.start({
            customerId: testCustomerId,
            offerId: testOfferIds.proMonthly,
            successUrl: "https://app.test/success",
            cancelUrl: "https://app.test/cancel"
          })
        )

        expect(Either.isLeft(result)).toBe(true)
        if (Either.isLeft(result)) {
          expect((result.left as { readonly _tag?: string })._tag).toBe("CommercialWorkflowConflict")
          expect((result.left as { readonly workflow?: string }).workflow).toBe("checkout.start")
        }
        expect(payment.calls.checkout.prepare).toHaveLength(1)
        expect(yield* countRows("paykit_checkout_intent")).toBe(0)
      }),
      payment.layer
    )
  })
})
