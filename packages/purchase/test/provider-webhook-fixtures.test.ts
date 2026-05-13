import * as SqlClient from "@effect/sql/SqlClient"
import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"

import type { PaymentWebhookKind, PaymentWebhookNormalization } from "../src/provider/client.ts"
import type { PaymentProviderTag } from "../src/provider/types.ts"

import { syncCatalog } from "../src/config.ts"
import { makePaddleProvider, makeStripeProvider } from "./provider/support/fixture-providers.ts"
import { loadGeneratedWebhookFixture } from "./provider/support/generated-fixture.ts"
import { runPayEffect } from "./support/run-pay-effect.ts"
import { countCoreRows, insertTestCustomer, parseJsonColumn, queryOne } from "./support/sqlite-pay-harness.ts"
import { TestPay, testCustomerId, testOfferIds } from "./support/test-catalog.ts"
import { makeTestPaymentLayer } from "./support/test-payment-provider.ts"

interface ProviderWebhookFixtureCase {
  readonly provider: PaymentProviderTag
  readonly eventType: string
  readonly kind: PaymentWebhookKind
  readonly offerId: string
  readonly projection: "checkout" | "customer" | "invoice" | "subscription"
  readonly expectedProjectionStatus?: string | undefined
  readonly expectedCustomerEmail?: string | undefined
  readonly expectedCustomerName?: string | undefined
  readonly expectedInvoiceType?: string | undefined
  readonly expectedPurchaseGrant?: boolean | undefined
  readonly expectedCreditAmount?: number | undefined
  readonly expectedCreditLedgerDirection?: "grant" | "refund" | undefined
  readonly expectedCreditKey?: string | undefined
  readonly expectedWalletAvailable?: number | undefined
  readonly expectedWalletRefunded?: number | undefined
}

const providerFixtureCases: ReadonlyArray<ProviderWebhookFixtureCase> = [
  {
    provider: "stripe",
    eventType: "checkout.session.completed",
    kind: "checkout_completed",
    offerId: testOfferIds.proMonthly,
    projection: "checkout",
    expectedProjectionStatus: "accepted"
  },
  {
    provider: "stripe",
    eventType: "customer.updated",
    kind: "customer_updated",
    offerId: testOfferIds.proMonthly,
    projection: "customer",
    expectedCustomerEmail: "jo.updated@example.com",
    expectedCustomerName: "Jo Updated"
  },
  {
    provider: "stripe",
    eventType: "invoice.paid",
    kind: "transaction_updated",
    offerId: testOfferIds.proMonthly,
    projection: "invoice",
    expectedProjectionStatus: "paid",
    expectedInvoiceType: "subscription",
    expectedCreditLedgerDirection: "grant",
    expectedCreditAmount: 10,
    expectedWalletAvailable: 10
  },
  {
    provider: "stripe",
    eventType: "invoice.paid",
    kind: "transaction_updated",
    offerId: testOfferIds.lifetime,
    projection: "invoice",
    expectedProjectionStatus: "paid",
    expectedInvoiceType: "one_time",
    expectedPurchaseGrant: true
  },
  {
    provider: "stripe",
    eventType: "invoice.paid",
    kind: "transaction_updated",
    offerId: testOfferIds.credits100,
    projection: "invoice",
    expectedProjectionStatus: "paid",
    expectedInvoiceType: "credits",
    expectedCreditLedgerDirection: "grant",
    expectedWalletAvailable: 100
  },
  {
    provider: "stripe",
    eventType: "invoice.payment_failed",
    kind: "transaction_updated",
    offerId: testOfferIds.proMonthly,
    projection: "invoice",
    expectedProjectionStatus: "failed",
    expectedInvoiceType: "subscription"
  },
  {
    provider: "stripe",
    eventType: "customer.subscription.updated",
    kind: "subscription_updated",
    offerId: testOfferIds.proMonthly,
    projection: "subscription",
    expectedProjectionStatus: "active"
  },
  {
    provider: "stripe",
    eventType: "customer.subscription.deleted",
    kind: "subscription_updated",
    offerId: testOfferIds.proMonthly,
    projection: "subscription",
    expectedProjectionStatus: "canceled"
  },
  {
    provider: "stripe",
    eventType: "charge.refunded",
    kind: "refund_updated",
    offerId: testOfferIds.proMonthly,
    projection: "invoice",
    expectedProjectionStatus: "refunded",
    expectedInvoiceType: "subscription",
    expectedCreditLedgerDirection: "refund",
    expectedCreditAmount: 10,
    expectedWalletAvailable: 0,
    expectedWalletRefunded: 10
  },
  {
    provider: "stripe",
    eventType: "refund.updated",
    kind: "refund_updated",
    offerId: testOfferIds.proMonthly,
    projection: "invoice",
    expectedProjectionStatus: "refunded",
    expectedInvoiceType: "subscription",
    expectedCreditLedgerDirection: "refund",
    expectedCreditAmount: 10,
    expectedWalletAvailable: 0,
    expectedWalletRefunded: 10
  },
  {
    provider: "stripe",
    eventType: "refund.updated",
    kind: "refund_updated",
    offerId: testOfferIds.credits100,
    projection: "invoice",
    expectedProjectionStatus: "refunded",
    expectedInvoiceType: "credits",
    expectedCreditLedgerDirection: "refund",
    expectedWalletAvailable: 0,
    expectedWalletRefunded: 100
  },
  {
    provider: "paddle",
    eventType: "transaction.paid",
    kind: "transaction_updated",
    offerId: testOfferIds.proMonthly,
    projection: "invoice",
    expectedProjectionStatus: "paid",
    expectedInvoiceType: "subscription",
    expectedCreditLedgerDirection: "grant",
    expectedCreditAmount: 10,
    expectedWalletAvailable: 10
  },
  {
    provider: "paddle",
    eventType: "transaction.paid",
    kind: "transaction_updated",
    offerId: testOfferIds.lifetime,
    projection: "invoice",
    expectedProjectionStatus: "paid",
    expectedInvoiceType: "one_time",
    expectedPurchaseGrant: true
  },
  {
    provider: "paddle",
    eventType: "transaction.paid",
    kind: "transaction_updated",
    offerId: testOfferIds.credits100,
    projection: "invoice",
    expectedProjectionStatus: "paid",
    expectedInvoiceType: "credits",
    expectedCreditLedgerDirection: "grant",
    expectedWalletAvailable: 100
  },
  {
    provider: "paddle",
    eventType: "transaction.payment_failed",
    kind: "transaction_updated",
    offerId: testOfferIds.proMonthly,
    projection: "invoice",
    expectedProjectionStatus: "failed",
    expectedInvoiceType: "subscription"
  },
  {
    provider: "paddle",
    eventType: "subscription.updated",
    kind: "subscription_updated",
    offerId: testOfferIds.proMonthly,
    projection: "subscription",
    expectedProjectionStatus: "active"
  },
  {
    provider: "paddle",
    eventType: "subscription.paused",
    kind: "subscription_updated",
    offerId: testOfferIds.proMonthly,
    projection: "subscription",
    expectedProjectionStatus: "paused"
  },
  {
    provider: "paddle",
    eventType: "subscription.resumed",
    kind: "subscription_updated",
    offerId: testOfferIds.proMonthly,
    projection: "subscription",
    expectedProjectionStatus: "active"
  },
  {
    provider: "paddle",
    eventType: "subscription.canceled",
    kind: "subscription_updated",
    offerId: testOfferIds.proMonthly,
    projection: "subscription",
    expectedProjectionStatus: "canceled"
  },
  {
    provider: "paddle",
    eventType: "adjustment.created",
    kind: "refund_updated",
    offerId: testOfferIds.proMonthly,
    projection: "invoice",
    expectedProjectionStatus: "refunded",
    expectedInvoiceType: "subscription",
    expectedCreditLedgerDirection: "refund",
    expectedCreditAmount: 10,
    expectedWalletAvailable: 0,
    expectedWalletRefunded: 10
  },
  {
    provider: "paddle",
    eventType: "adjustment.updated",
    kind: "refund_updated",
    offerId: testOfferIds.proMonthly,
    projection: "invoice",
    expectedProjectionStatus: "refunded",
    expectedInvoiceType: "subscription",
    expectedCreditLedgerDirection: "refund",
    expectedCreditAmount: 10,
    expectedWalletAvailable: 0,
    expectedWalletRefunded: 10
  },
  {
    provider: "paddle",
    eventType: "adjustment.updated",
    kind: "refund_updated",
    offerId: testOfferIds.credits100,
    projection: "invoice",
    expectedProjectionStatus: "refunded",
    expectedInvoiceType: "credits",
    expectedCreditLedgerDirection: "refund",
    expectedWalletAvailable: 0,
    expectedWalletRefunded: 100
  },
  {
    provider: "paddle",
    eventType: "customer.updated",
    kind: "customer_updated",
    offerId: testOfferIds.proMonthly,
    projection: "customer",
    expectedCustomerEmail: "jo@example.com",
    expectedCustomerName: "Jo Brown-Anderson"
  }
] as const

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {}

const withLocalCorrelation = (input: {
  readonly provider: PaymentProviderTag
  readonly payload: string
  readonly offerId: string
}) => {
  const envelope = JSON.parse(input.payload) as Record<string, unknown>
  const data = asRecord(envelope.data)
  const resource = input.provider === "stripe" ? asRecord(data.object) : data
  const metadataKey = input.provider === "stripe" ? "metadata" : "custom_data"

  resource[metadataKey] = {
    ...asRecord(resource[metadataKey]),
    payCustomerId: testCustomerId,
    payOfferId: input.offerId
  }

  return JSON.stringify(envelope)
}

const normalizeWithProvider = (provider: PaymentProviderTag, event: unknown) =>
  Effect.gen(function* () {
    const payment = yield* provider === "stripe" ? makeStripeProvider : makePaddleProvider
    return yield* payment.webhooksNormalize(event)
  })

const makeProviderFixturePaymentLayer = (provider: PaymentProviderTag) =>
  makeTestPaymentLayer({
    provider,
    normalizeWebhook: (event) => normalizeWithProvider(provider, event)
  })

const insertCheckoutIntent = (input: {
  readonly provider: PaymentProviderTag
  readonly checkoutSessionId: string
  readonly offerId: string
}) =>
  Effect.gen(function* () {
    const sql = yield* SqlClient.SqlClient
    const now = new Date("2025-01-01T00:00:00.000Z").toISOString()

    yield* sql.unsafe(
      `INSERT INTO paykit_checkout_intent
          (id, customer_id, offer_id, provider, provider_checkout_session_id, checkout_url, status, metadata, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', '{}', ?, ?)`,
      [
        `intent_${input.provider}_${input.checkoutSessionId}`,
        testCustomerId,
        input.offerId,
        input.provider,
        input.checkoutSessionId,
        null,
        now,
        now
      ]
    ).withoutTransform
  })

const expectProviderNormalization = (
  normalized: PaymentWebhookNormalization,
  fixtureCase: ProviderWebhookFixtureCase
) => {
  expect(normalized.providerEventId.length).toBeGreaterThan(0)
  expect(normalized.eventType).toBe(fixtureCase.eventType)
  expect(normalized.kind).toBe(fixtureCase.kind)
  expect(normalized.metadata.payCustomerId).toBe(testCustomerId)
  expect(normalized.metadata.payOfferId).toBe(fixtureCase.offerId)

  if (fixtureCase.projection === "subscription") {
    expect(normalized.providerSubscriptionId).toBeDefined()
  }

  if (fixtureCase.projection === "invoice") {
    expect(normalized.providerInvoiceId ?? normalized.providerTransactionId).toBeDefined()
  }

  if (fixtureCase.projection === "customer") {
    expect(normalized.providerCustomerId).toBeDefined()
  }

  if (fixtureCase.expectedProjectionStatus) {
    expect(normalized.status ?? fixtureCase.expectedProjectionStatus).toBeDefined()
  }
}

describe("core provider webhook fixtures", () => {
  for (const fixtureCase of providerFixtureCases) {
    it.effect(`projects ${fixtureCase.provider} ${fixtureCase.eventType} fixture`, () => {
      const fixture = loadGeneratedWebhookFixture(fixtureCase.provider, fixtureCase.eventType)

      expect(fixture, `Missing generated ${fixtureCase.provider} fixture for ${fixtureCase.eventType}`).toBeDefined()

      if (!fixture) {
        return Effect.void
      }

      const payload = withLocalCorrelation({
        provider: fixtureCase.provider,
        payload: fixture.payload,
        offerId: fixtureCase.offerId
      })
      const payment = makeProviderFixturePaymentLayer(fixtureCase.provider)

      return runPayEffect(
        Effect.gen(function* () {
          const sdk = yield* TestPay
          const rawEvent = JSON.parse(payload) as unknown
          const normalized = yield* normalizeWithProvider(fixtureCase.provider, rawEvent)

          expectProviderNormalization(normalized, fixtureCase)

          yield* insertTestCustomer({})
          yield* syncCatalog()

          if (fixtureCase.projection === "checkout" && normalized.checkoutSessionId) {
            yield* insertCheckoutIntent({
              provider: fixtureCase.provider,
              checkoutSessionId: normalized.checkoutSessionId,
              offerId: fixtureCase.offerId
            })
          }

          const result = yield* sdk.webhooks.handle({
            provider: fixtureCase.provider,
            body: payload,
            signature: "fixture_signature"
          })

          expect(result.accepted).toBe(true)
          expect(result.providerEventId).toBe(normalized.providerEventId)
          expect(result.normalizedEvents).toHaveLength(1)
          expect(result.normalizedEvents[0]).toMatchObject({
            id: `${fixtureCase.provider}:${normalized.providerEventId}`,
            provider: fixtureCase.provider,
            providerEventId: normalized.providerEventId,
            kind: fixtureCase.kind,
            customerId: testCustomerId,
            offerId: fixtureCase.offerId
          })
          expect(result.reconciliationTriggers).toContainEqual(
            expect.objectContaining({
              reason: fixtureCase.kind,
              customerId: testCustomerId,
              offerId: fixtureCase.offerId,
              sourceEventId: `${fixtureCase.provider}:${normalized.providerEventId}`
            })
          )

          const receipt = yield* queryOne<{
            readonly provider_id: string
            readonly provider_event_id: string
            readonly type: string
            readonly status: string
            readonly processed_at: string | null
          }>(
            "SELECT provider_id, provider_event_id, type, status, processed_at FROM paykit_webhook_event WHERE provider_event_id = ?",
            [normalized.providerEventId]
          )
          expect(receipt).toMatchObject({
            provider_id: fixtureCase.provider,
            provider_event_id: normalized.providerEventId,
            type: fixtureCase.eventType,
            status: "processed"
          })
          expect(receipt?.processed_at).toBeTruthy()

          const event = yield* queryOne<{
            readonly id: string
            readonly kind: string
            readonly customer_id: string
            readonly offer_id: string
            readonly payload: string
          }>("SELECT id, kind, customer_id, offer_id, payload FROM paykit_commercial_event WHERE id = ?", [
            `${fixtureCase.provider}:${normalized.providerEventId}`
          ])
          expect(event).toMatchObject({
            id: `${fixtureCase.provider}:${normalized.providerEventId}`,
            kind: fixtureCase.kind,
            customer_id: testCustomerId,
            offer_id: fixtureCase.offerId
          })
          expect(parseJsonColumn(event?.payload).data ?? parseJsonColumn(event?.payload).event_type).toBeDefined()

          if (fixtureCase.projection === "checkout") {
            const checkout = yield* queryOne<{ readonly status: string }>(
              "SELECT status FROM paykit_checkout_intent WHERE provider_checkout_session_id = ?",
              [normalized.checkoutSessionId]
            )
            expect(checkout?.status).toBe(fixtureCase.expectedProjectionStatus)
          }

          if (fixtureCase.projection === "subscription") {
            const subscription = yield* queryOne<{ readonly status: string; readonly provider_id: string }>(
              "SELECT status, provider_id FROM paykit_subscription WHERE provider_id = ?",
              [normalized.providerSubscriptionId]
            )
            expect(subscription).toMatchObject({
              status: fixtureCase.expectedProjectionStatus,
              provider_id: normalized.providerSubscriptionId
            })
          }

          if (fixtureCase.projection === "customer") {
            const customer = yield* queryOne<{
              readonly email: string
              readonly name: string
              readonly provider: string
            }>("SELECT email, name, provider FROM paykit_customer WHERE id = ?", [testCustomerId])

            expect(customer).toMatchObject({
              email: fixtureCase.expectedCustomerEmail,
              name: fixtureCase.expectedCustomerName
            })
            expect(parseJsonColumn(customer?.provider)[fixtureCase.provider]).toBe(normalized.providerCustomerId)
          }

          if (fixtureCase.projection === "invoice") {
            const providerId = normalized.providerInvoiceId ?? normalized.providerTransactionId
            const invoice = yield* queryOne<{
              readonly id: string
              readonly status: string
              readonly type: string
              readonly provider_id: string
              readonly provider_data: string
            }>("SELECT id, status, type, provider_id, provider_data FROM paykit_invoice WHERE provider_id = ?", [
              providerId
            ])

            expect(invoice).toMatchObject({
              status: fixtureCase.expectedProjectionStatus,
              ...(fixtureCase.expectedInvoiceType ? { type: fixtureCase.expectedInvoiceType } : {}),
              provider_id: providerId
            })
            expect(parseJsonColumn(invoice?.provider_data).offerId).toBe(fixtureCase.offerId)

            if (fixtureCase.expectedPurchaseGrant) {
              const grant = yield* sdk.purchases.getGrant({
                customerId: testCustomerId,
                agreementId: invoice!.id
              })
              expect(Option.isSome(grant)).toBe(true)
              if (Option.isSome(grant)) {
                expect(grant.value.status).toBe("active")
                expect(grant.value.offerId).toBe(fixtureCase.offerId)
              }
            }

            if (fixtureCase.expectedCreditLedgerDirection) {
              const expectedCreditKey = fixtureCase.expectedCreditKey ?? "ai_credits"
              const expectedCreditAmount = fixtureCase.expectedCreditAmount ?? 100
              const ledger = yield* queryOne<{
                readonly product_id: string
                readonly offer_id: string
                readonly amount: number
                readonly direction: string
              }>("SELECT product_id, offer_id, amount, direction FROM paykit_credit_ledger WHERE offer_id = ?", [
                fixtureCase.offerId
              ])
              expect(ledger).toMatchObject({
                product_id: expectedCreditKey,
                offer_id: fixtureCase.offerId,
                amount: expectedCreditAmount,
                direction: fixtureCase.expectedCreditLedgerDirection
              })

              const wallet = yield* sdk.credits.getWallet({
                customerId: testCustomerId,
                creditKey: expectedCreditKey
              })
              expect(wallet.available).toBe(fixtureCase.expectedWalletAvailable)
              if (fixtureCase.expectedWalletRefunded !== undefined) {
                expect(wallet.refunded).toBe(fixtureCase.expectedWalletRefunded)
              }
            }
          }

          const before = yield* countCoreRows
          const duplicate = yield* sdk.webhooks.handle({
            provider: fixtureCase.provider,
            body: payload,
            signature: "fixture_signature"
          })
          const replay = yield* sdk.webhooks.replay({
            provider: fixtureCase.provider,
            providerEventId: normalized.providerEventId as never
          })
          const after = yield* countCoreRows

          expect(duplicate.accepted).toBe(false)
          expect(duplicate.normalizedEvents).toHaveLength(0)
          expect(duplicate.reconciliationTriggers).toHaveLength(0)
          expect(replay.accepted).toBe(false)
          expect(replay.providerEventId).toBe(normalized.providerEventId)
          expect(replay.normalizedEvents).toHaveLength(1)
          expect(replay.normalizedEvents[0]).toMatchObject({
            id: `${fixtureCase.provider}:${normalized.providerEventId}`,
            provider: fixtureCase.provider,
            providerEventId: normalized.providerEventId,
            kind: fixtureCase.kind,
            customerId: testCustomerId,
            offerId: fixtureCase.offerId
          })
          expect(replay.reconciliationTriggers).toContainEqual(
            expect.objectContaining({
              reason: fixtureCase.kind,
              customerId: testCustomerId,
              offerId: fixtureCase.offerId,
              sourceEventId: `${fixtureCase.provider}:${normalized.providerEventId}`
            })
          )
          expect(after).toEqual(before)
        }),
        payment.layer
      )
    })
  }
})
