import { describe, layer } from "@effect/vitest"
import { Effect } from "effect"

import { notesProMonthlySubscription } from "../../business-fixtures.ts"
import { assert } from "../../utils/assertions.ts"
import { Harness } from "../../utils/harness.ts"
import { filteredScenarioPaymentProviders, makeScenarioRuntime } from "../../utils/scenario-runtime.ts"

describe.each(filteredScenarioPaymentProviders)(
  "%s subscription acquisition scenarios",
  (_providerName, paymentProvider) => {
    const Live = makeScenarioRuntime(paymentProvider)

    // Subscription acquisition scenarios cover the first conversion from free user to active subscriber.
    layer(Live, { excludeTestServices: true })((it) => {
      // A real sandbox checkout should end with an active agreement visible to the app.
      // Implementation note:
      // - drive the flow only through app HTTP APIs plus provider harness
      // - verify provider-side subscription/transaction through PaymentProvider
      // - verify local webhook receipt, intent, subscription, and entitlement rows through SqlClient
      // - assert account snapshot before and after webhook projection
      // - keep provider transaction ids as diagnostics, not primary assertions
      it.effect(
        "completes a provider sandbox subscription checkout and returns an active subscription in the account snapshot",
        Effect.fn(function* () {
          const harness = yield* Harness
          const session = yield* harness.createCustomerAccount()
          const before = yield* harness.getAccount(session)
          assert.account.noSubscriptionAccess(before, {
            offerId: notesProMonthlySubscription.offerId,
            benefitKeys: notesProMonthlySubscription.enabledBenefits
          })
          const result = yield* harness.purchaseSubscription({
            session,
            offerId: notesProMonthlySubscription.offerId
          })
          assert.subscription.acquired(result, {
            offerId: notesProMonthlySubscription.offerId,
            customerEmail: session.email,
            enabledBenefits: notesProMonthlySubscription.enabledBenefits,
            quotaBenefits: notesProMonthlySubscription.quotaBenefits
          })
        })
      )

      // The golden path must prove the three states agree, not just that the browser payment succeeded.
      // Implementation note:
      // - assert provider subscription/transaction status through PaymentProvider
      // - assert durable checkout intent, webhook receipt, commercial event, subscription, invoice, and provider_ref rows
      // - assert public snapshot and entitlements expose commercial ids rather than provider ids
      it.todo("keeps provider state, durable local state, and account read models consistent after acquisition")

      // Entitlements should only appear after webhook processing has projected the subscription.
      // Implementation note:
      // - explicitly observe the pre-webhook or pre-projection window
      // - assert no paid entitlements leak early
      // - then assert feature/quota entitlements appear after reconciliation
      it.todo(
        "grants the correct subscription entitlements only after the webhook round-trip has been accepted and projected"
      )

      // Provider success without local reconciliation must not leak paid access.
      // Implementation note:
      // - complete provider payment but delay or suppress local webhook handling
      // - assert account snapshot still reflects unpaid or default-only state
      it.todo(
        "does not leak entitlements when the checkout succeeds at the provider but the webhook has not yet been processed"
      )

      // Provider metadata is useful but should not be the only recovery path.
      // Implementation note:
      // - complete checkout with missing or partial custom_data where the provider allows it
      // - recover customer and offer through checkout intent, provider customer ref, subscription id, or invoice id
      // - assert the recovered commercial ids match the original user and offer
      it.todo(
        "recovers subscription ownership when provider metadata is missing but durable provider refs can reconnect it"
      )

      // Recovery must isolate tenants when provider refs or metadata point at the wrong local customer.
      // Implementation note:
      // - create two app customers and force the recovery path to see conflicting provider identity
      // - assert the webhook is rejected or left unhandled without mutating either customer's paid state
      // - verify durable diagnostics explain the rejected association
      it.todo("rejects ambiguous or cross-customer subscription recovery without granting paid access")

      // Duplicate provider deliveries must not create duplicate commercial agreements.
      // Implementation note:
      // - replay checkout completion and subscription update delivery
      // - assert provider-side state is unchanged
      // - assert local durable rows are not duplicated
      // - assert one local agreement and stable entitlements
      it.todo(
        "recovers from duplicate checkout completion and subscription update webhooks without creating duplicate agreements"
      )

      // Provider event order is not guaranteed during acquisition.
      // Implementation note:
      // - observe checkout completion, invoice paid, and subscription update in different delivery orders
      // - assert interim states remain conservative
      // - assert final snapshot, subscription, invoice, and entitlements converge to the same business state
      it.todo("converges to one active subscription when acquisition webhooks arrive out of order")

      // Initial payment failure paths are part of real subscription billing.
      // Implementation note:
      // - if the sandbox allows, exercise failure or requires-action
      // - otherwise keep this as a documented todo until harness support exists
      // - assert local status remains non-active
      it.todo(
        "handles an initial payment failure or requires-action path without marking the local subscription active"
      )

      // E2E failures need enough evidence to tell provider, broker, app, and projection failures apart.
      // Implementation note:
      // - include runId, checkout session id, provider transaction/subscription ids, broker route, and account snapshot
      // - assert diagnostics are available without directly reading provider browser internals from the scenario
      it.todo("records acquisition diagnostics that identify provider, broker, app, webhook, and projection failures")
    })
  }
)
