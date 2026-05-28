import { Paddle } from "@effect-x/purchase/paddle"
import { Stripe } from "@effect-x/purchase/stripe"
import { layer, describe, beforeAll, afterAll } from "@effect/vitest"
import * as Effect from "effect/Effect"

import {
  expectCompletedSubscriptionAcquisition,
  expectUnknownOfferCheckoutDeniedWithoutLocalState
} from "../../utils/assertions.ts"
import {
  aiCredits500Pack,
  desktopLifetimePurchase,
  notesProMonthlySubscription
} from "../../utils/business-fixtures.ts"
import * as Harness from "../../utils/harness.ts"
import { makeScenarioRuntime } from "../../utils/scenario-runtime.ts"

describe.each([
  ["Paddle", Paddle]
  // ["Stripe", Stripe.layer]
])("[%s], checkout lifecycle scenarios", (_provider, paymentClient) => {
  const Live = makeScenarioRuntime({ paymentClient })

  // Checkout e2e scenarios cover the path from app API to hosted provider payment entry points.
  layer(Live, { excludeTestServices: true })((it) => {
    // The app needs to complete a real provider checkout and reconnect provider completion back to local state.
    it.effect("completes a hosted checkout for a signed-in user and reconnects the completed payment", () =>
      Effect.gen(function* () {
        const session = yield* Harness.createCustomerAccount()
        const result = yield* Harness.buySubscription({
          session,
          offerId: notesProMonthlySubscription.offerId
        })

        expectCompletedSubscriptionAcquisition(result, {
          offerId: notesProMonthlySubscription.offerId,
          customerEmail: session.email,
          enabledBenefits: notesProMonthlySubscription.enabledBenefits,
          quotaBenefits: notesProMonthlySubscription.quotaBenefits
        })
      })
    )

    it.effect.skip("rejects unknown offers without creating provider or local checkout state", () =>
      Effect.gen(function* () {
        const unknownOfferId = "notes:missing_plan"
        const session = yield* Harness.createCustomerAccount()
        const result = yield* Harness.tryStartCheckout({
          session,
          offerId: unknownOfferId
        })
        const account = yield* Harness.viewAccount(session)
        const durable = yield* Harness.getDurableState(session)

        expectUnknownOfferCheckoutDeniedWithoutLocalState(result, account, durable, {
          offerId: unknownOfferId
        })
      })
    )

    // One-time purchases should become durable grants after real payment completion.
    it.todo(
      `completes ${desktopLifetimePurchase.offerId} checkout and exposes an active purchase grant in the account API`
    )

    // Credit-pack purchases should land in the wallet only after reconciliation succeeds.
    it.todo(`completes ${aiCredits500Pack.offerId} checkout and reflects the acquired balance in wallet endpoints`)

    // Abandoned or expired checkouts must not grant any paid state.
    it.todo(
      "marks abandoned or expired checkouts as non-active without granting subscription, purchase, or credit state"
    )
  })
})
