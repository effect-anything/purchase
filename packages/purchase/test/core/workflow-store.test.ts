import { describe, expect, it } from "@effect/vitest"
import * as Effect from "effect/Effect"
import * as Option from "effect/Option"

import { CommercialEvent } from "../../src/core/commercial-schema.ts"
import { CommercialWorkflowStore } from "../../src/core/workflow-store.ts"
import { runCorePayEffect } from "../support/run-core-pay-effect.ts"
import { insertTestCustomer, queryAll, queryOne } from "../support/sqlite-pay-harness.ts"
import { testCustomerId, testOfferIds } from "../support/test-catalog.ts"
import { makeTestPaymentLayer } from "../support/test-payment-provider.ts"

describe("core workflow store", () => {
  it.effect("persists customer mappings, checkout intents, webhooks, events and credit ledger rows", () => {
    const payment = makeTestPaymentLayer()

    return runCorePayEffect(
      Effect.gen(function* () {
        const store = yield* CommercialWorkflowStore

        yield* insertTestCustomer({ id: testCustomerId })

        const attached = yield* store.attachProviderCustomer({
          customerId: testCustomerId,
          provider: "stripe",
          providerCustomerId: "cus_test_123"
        })
        yield* store.persistCheckoutIntent({
          intentId: "intent_123",
          customerId: testCustomerId,
          offerId: testOfferIds.proMonthly,
          provider: "stripe",
          providerCheckoutSessionId: "cs_123",
          checkoutUrl: "https://checkout.test/session/cs_123",
          metadata: { source: "test" }
        })
        yield* store.markCheckoutIntentStatus({
          providerCheckoutSessionId: "cs_123",
          status: "completed"
        })

        const firstWebhook = yield* store.persistWebhookReceipt({
          provider: "stripe",
          providerEventId: "evt_123",
          type: "checkout.session.completed",
          payload: { id: "evt_123" }
        })
        const duplicateWebhook = yield* store.persistWebhookReceipt({
          provider: "stripe",
          providerEventId: "evt_123",
          type: "checkout.session.completed",
          payload: { id: "evt_123" }
        })
        yield* store.markWebhookProcessed({
          provider: "stripe",
          providerEventId: "evt_123"
        })

        yield* store.persistCommercialEvents({
          events: [
            CommercialEvent.make({
              id: "stripe:evt_123" as never,
              providerEventId: "evt_123" as never,
              provider: "stripe",
              kind: "checkout_completed",
              occurredAt: new Date("2025-01-01T00:00:00.000Z"),
              customerId: testCustomerId,
              offerId: testOfferIds.proMonthly as never,
              payload: { id: "evt_123" }
            })
          ]
        })
        const firstLedger = yield* store.recordCreditLedger({
          id: "ledger_123",
          customerId: testCustomerId,
          productId: "ai_credits",
          offerId: testOfferIds.credits100,
          amount: 100,
          direction: "grant",
          idempotencyKey: "grant_123"
        })
        const duplicateLedger = yield* store.recordCreditLedger({
          id: "ledger_other",
          customerId: testCustomerId,
          productId: "ai_credits",
          amount: 100,
          direction: "grant",
          idempotencyKey: "grant_123"
        })

        const customer = yield* store.getCustomerProfile({ customerId: testCustomerId })
        const customerByProvider = yield* store.findCustomerByProviderRef({
          provider: "stripe",
          providerCustomerId: "cus_test_123"
        })
        const checkoutIntent = yield* store.findCheckoutIntentByProviderSession({
          providerCheckoutSessionId: "cs_123"
        })
        const webhookRow = yield* queryOne<{ readonly status: string }>(
          `SELECT status FROM paykit_webhook_event WHERE provider_event_id = 'evt_123'`
        )
        const eventRows = yield* queryAll<{ readonly id: string }>("SELECT id FROM paykit_commercial_event")
        const ledgerRows = yield* store.listCreditLedger({ customerId: testCustomerId, productId: "ai_credits" })

        expect(attached.provider.stripe).toBe("cus_test_123")
        expect(Option.getOrUndefined(customer)?.provider.stripe).toBe("cus_test_123")
        expect(Option.getOrUndefined(customerByProvider)?.id).toBe(testCustomerId)
        expect(Option.getOrUndefined(checkoutIntent)?.status).toBe("completed")
        expect(firstWebhook.duplicate).toBe(false)
        expect(duplicateWebhook.duplicate).toBe(true)
        expect(webhookRow?.status).toBe("processed")
        expect(eventRows.map((row) => row.id)).toEqual(["stripe:evt_123"])
        expect(firstLedger.duplicate).toBe(false)
        expect(duplicateLedger.duplicate).toBe(true)
        expect(ledgerRows).toHaveLength(1)
      }),
      payment.layer
    )
  })
})
