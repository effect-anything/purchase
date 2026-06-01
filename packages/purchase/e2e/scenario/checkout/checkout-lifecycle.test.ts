import { describe, layer } from "@effect/vitest"
import { Effect } from "effect"

import { assert } from "../../utils/assertions.ts"
import {
  aiCredits500Pack,
  desktopLifetimePurchase,
  notesProMonthlySubscription
} from "../../utils/business-fixtures.ts"
import * as Harness from "../../utils/harness.ts"
import { filteredScenarioPaymentProviders, makeScenarioRuntime } from "../../utils/scenario-runtime.ts"

describe.each(filteredScenarioPaymentProviders)("%s checkout lifecycle scenarios", (_providerName, paymentProvider) => {
  const Live = makeScenarioRuntime(paymentProvider)

  // Checkout e2e scenarios stop at the hosted provider payment entry point.
  // Payment completion, webhook projection, and account entitlements live in acquisition scenarios.
  layer(Live, { excludeTestServices: true })((it) => {
    it.effect("creates a real subscription checkout without granting paid access before payment", () =>
      Effect.gen(function* () {
        const session = yield* Harness.createCustomerAccount()

        const checkout = yield* Harness.checkout({
          session,
          offerId: notesProMonthlySubscription.offerId
        })
        const account = yield* Harness.getAccount(session)

        assert.checkout.startedWithoutSubscriptionAccess(checkout, account, {
          offerId: notesProMonthlySubscription.offerId,
          benefitKeys: notesProMonthlySubscription.enabledBenefits
        })
      })
    )

    it.effect("creates a real one-time purchase checkout without granting the durable purchase before payment", () =>
      Effect.gen(function* () {
        const session = yield* Harness.createCustomerAccount()
        const checkout = yield* Harness.checkout({
          session,
          offerId: desktopLifetimePurchase.offerId
        })
        const account = yield* Harness.getAccount(session)

        assert.checkout.reconnectable(checkout, {
          offerId: desktopLifetimePurchase.offerId
        })
        assert.account.noPurchaseAccess(account, {
          offerId: desktopLifetimePurchase.offerId
        })
      })
    )

    it.effect("creates a real credit-pack checkout without increasing the wallet before payment", () =>
      Effect.gen(function* () {
        const session = yield* Harness.createCustomerAccount()
        const checkout = yield* Harness.checkout({
          session,
          offerId: aiCredits500Pack.offerId
        })
        const account = yield* Harness.getAccount(session)

        assert.checkout.reconnectable(checkout, {
          offerId: aiCredits500Pack.offerId
        })
        assert.credit.noAccountWallet(account, {
          creditKey: aiCredits500Pack.creditKey
        })
      })
    )

    it.effect("rejects unknown offers without creating provider or local checkout state", () =>
      Effect.gen(function* () {
        const unknownOfferId = "notes:missing_plan"
        const session = yield* Harness.createCustomerAccount()
        const result = yield* Harness.tryStartCheckout({
          session,
          offerId: unknownOfferId
        })
        const account = yield* Harness.getAccount(session)
        const durable = yield* Harness.getDurableState(session)

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
