import { PurchaseSDK } from "@effect-x/purchase"
import { Paddle } from "@effect-x/purchase/paddle"
import { Stripe } from "@effect-x/purchase/stripe"
import { Effect, Layer } from "effect"

import { CommercialPlans, CommercialProducts } from "../../catalog.ts"

// This is the example app's canonical SDK onboarding file.
// External adopters should start from the root @effect-x/purchase import, bind
// their catalog to PurchaseSDK, then provide exactly one active provider layer in
// their app runtime.
export class PurchaseService extends PurchaseSDK<
  PurchaseService,
  {},
  typeof CommercialPlans,
  typeof CommercialProducts
>({
  plans: CommercialPlans,
  products: CommercialProducts
}) {
  static Default = this.make(
    this,
    Effect.gen(function* () {
      return {
        hello: () => Effect.withSpan("hello")(Effect.succeed("OK"))
      }
    })
  )

  // These helpers are intentionally provider-config-free. App runtimes compose
  // them with Stripe.layerConfig(...) or Paddle.layerConfig(...) so sandbox/test
  // credentials stay at the runtime boundary.
  static get Stripe() {
    return this.Default.pipe(Layer.provide(Stripe.layer))
  }

  static get Paddle() {
    return this.Default.pipe(Layer.provide(Paddle.layer))
  }
}
