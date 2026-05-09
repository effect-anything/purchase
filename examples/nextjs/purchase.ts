import { Paddle, PurchaseSDK, Stripe } from "@effect-x/purchase"
import { Effect, Layer } from "effect"

import { CommercialPlans, CommercialProducts } from "./catalog.ts"

// This is the example app's canonical SDK onboarding file.
// External adopters should start from the root @effect-x/purchase import, bind
// their catalog to PurchaseSDK, then provide exactly one active provider layer in
// their app runtime.
export class Pay extends PurchaseSDK<Pay, {}, typeof CommercialPlans, typeof CommercialProducts>({
  plans: CommercialPlans,
  products: CommercialProducts
}) {
  static Layer = Pay.make(
    Pay,
    Effect.gen(function* () {
      return {
        hello: () => Effect.withSpan("hello")(Effect.succeed("OK"))
      }
    })
  )

  // These helpers are intentionally provider-config-free. App runtimes compose
  // them with Stripe.layerConfig(...) or Paddle.layerConfig(...) so sandbox/test
  // credentials stay at the runtime boundary.
  static Stripe = Pay.Layer.pipe(Layer.provide(Stripe.layer))

  static Paddle = Pay.Layer.pipe(Layer.provide(Paddle.layer))
}
