import { describe, layer } from "@effect/vitest"
import { Effect } from "effect"

import { aiCredits500Pack, desktopLifetimePurchase, notesProMonthlySubscription } from "../../business-fixtures.ts"
import { assert } from "../../utils/assertions.ts"
import { Harness } from "../../utils/harness.ts"
import { filteredScenarioPaymentProviders, makeScenarioRuntime } from "../../utils/scenario-runtime.ts"

// Checkout e2e scenarios stop at the hosted provider payment entry point.
// Payment completion, webhook projection, and account entitlements live in acquisition scenarios.
describe.each(filteredScenarioPaymentProviders)("%s checkout lifecycle scenarios", (_providerName, paymentProvider) => {
  const Live = makeScenarioRuntime(paymentProvider)

  layer(Live, { excludeTestServices: true })((it) => {
    it.effect(
      "creates a real subscription checkout without granting paid access before payment",
      Effect.fn(function* () {
        const harness = yield* Harness

        const session = yield* harness.createCustomerAccount()
        const checkout = yield* harness.checkout({
          session,
          offerId: notesProMonthlySubscription.offerId
        })
        const account = yield* harness.getAccount(session)

        assert.checkout.startedWithoutSubscriptionAccess(checkout, account, {
          offerId: notesProMonthlySubscription.offerId,
          benefitKeys: notesProMonthlySubscription.enabledBenefits
        })
      })
    )

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

    it.effect.skip(
      "creates a real one-time purchase checkout without granting the durable purchase before payment",
      Effect.fn(function* () {
        const harness = yield* Harness
        const session = yield* harness.createCustomerAccount()
        const checkout = yield* harness.checkout({
          session,
          offerId: desktopLifetimePurchase.offerId
        })
        const account = yield* harness.getAccount(session)

        assert.checkout.reconnectable(checkout, {
          offerId: desktopLifetimePurchase.offerId
        })
        assert.account.noPurchaseAccess(account, {
          offerId: desktopLifetimePurchase.offerId
        })
      })
    )

    it.effect.skip(
      "creates a real credit-pack checkout without increasing the wallet before payment",
      Effect.fn(function* () {
        const harness = yield* Harness
        const session = yield* harness.createCustomerAccount()
        const checkout = yield* harness.checkout({
          session,
          offerId: aiCredits500Pack.offerId
        })
        const account = yield* harness.getAccount(session)

        assert.checkout.reconnectable(checkout, {
          offerId: aiCredits500Pack.offerId
        })
        assert.credit.noAccountWallet(account, {
          creditKey: aiCredits500Pack.creditKey
        })
      })
    )

    it.effect.skip(
      "rejects unknown offers without creating provider or local checkout state",
      Effect.fn(function* () {
        const harness = yield* Harness
        const unknownOfferId = "notes:missing_plan"
        const session = yield* harness.createCustomerAccount()
        const result = yield* Effect.either(
          harness.checkout({
            session,
            offerId: unknownOfferId
          })
        )
        const account = yield* harness.getAccount(session)
        const durable = yield* harness.getDurableState(session)

        assert.checkout.unknownOfferDenied(result, account, durable, {
          offerId: unknownOfferId
        })
      })
    )

    // Abandoned or expired checkouts must remain conservative across provider, durable, and account state.
    it.todo(
      "marks abandoned or expired checkouts as non-active without granting subscription, purchase, or credit state"
    )
  })
})
