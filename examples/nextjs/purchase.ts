import { Paddle } from "@effect-x/purchase/paddle"
import { BaseSDK } from "@effect-x/purchase/sdk"
import { Stripe } from "@effect-x/purchase/stripe"
import { Effect, Layer } from "effect"

import { CommercialPlans, CommercialProducts } from "./catalog.ts"

// This file is the example project's pay runtime wiring.
// In repo discussions this is the closest equivalent to a "pay-kit.ts" setup file:
// it binds the shared commercial catalog to the reusable pay SDK and then
// provides provider-specific layers for Stripe and Paddle.
export class Pay extends BaseSDK<Pay, {}, typeof CommercialPlans, typeof CommercialProducts>({
  plans: CommercialPlans,
  products: CommercialProducts
}) {
  // Default
  static Layer2 = Pay.layer(Pay)

  static Layer = Pay.make(
    Pay,
    Effect.gen(function* () {
      return {
        hello: () => Effect.withSpan("hello")(Effect.succeed("OK"))
      }
    })
  )

  // Each runtime instance still runs with one active provider layer.
  static Stripe = Pay.Layer.pipe(Layer.provide(Stripe.layer))

  static Paddle = Pay.Layer.pipe(Layer.provide(Paddle.layer))
}
