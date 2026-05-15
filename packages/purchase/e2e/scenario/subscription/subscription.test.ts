import { PaymentHarness } from "@effect-x/purchase/harness"
import { Paddle } from "@effect-x/purchase/paddle"
import { PlatformConfigProvider } from "@effect/platform"
import { NodeContext } from "@effect/platform-node"
import { describe, expect, it } from "@effect/vitest"
import { Effect, Layer, Logger, LogLevel } from "effect"
import { inject } from "vitest"

import * as Harness from "../../http-api/harness.ts"

const providerE2E = inject("purchaseProviderE2E")
if (!providerE2E) {
  throw new Error("Missing purchaseProviderE2E global setup context")
}
process.env.PURCHASE_E2E_BROKER_URL = providerE2E.localBaseURL
process.env.PURCHASE_E2E_BROKER_PUBLIC_URL = providerE2E.publicBaseURL

const notesProMonthlyOfferId = "notes:notes_pro_monthly"

const providers = process.env.PROVIDER ? [process.env.PROVIDER] : ["paddle", "stripe"]

describe.each(providers)("Provider(%s) subscription e2e api harness", (provider) => {
  it.todo("OK")

  it.effect("pass", () =>
    Effect.gen(function* () {
      console.log("p1", process.env.PROVIDER)
    })
  )

  it.layer(Layer.empty)((it) => {
    it.effect("pass", () => Effect.gen(function* () {}))

    it.effect("pass2", () => Effect.gen(function* () {}))
  })
})

// describe("subscription e2e api harness", () => {
//   it.live.skip(
//     "completes a Paddle sandbox subscription checkout through the public tunnel",
//     () =>
//       Effect.gen(function* () {
//         const PaddleLive = Paddle.layer.pipe(
//           Layer.provide(PlatformConfigProvider.layerDotEnvAdd(".env.local")),
//           Layer.provide(PlatformConfigProvider.layerDotEnvAdd(".env")),
//           Layer.provide(NodeContext.layer),
//           Layer.orDie
//         )

//         const Live = HttpApiTesting.pipe(
//           Layer.provideMerge(PaymentHarness.make({ browser: { headless: process.env.PADDLE_E2E_HEADLESS !== "0" } })),
//           Layer.provideMerge(PaddleLive),
//           Layer.provide(Logger.pretty),
//           Layer.provide(Logger.minimumLogLevel(LogLevel.All))
//         )

//         const session = yield* Harness.signUp()
//         yield* Harness.registerWebhookTarget()
//         const result = yield* Harness.purchaseSubscription({ session, offerId: notesProMonthlyOfferId })
//         const activeOfferIds = result.account.snapshot?.activeOfferIds ?? []
//         const subscription = result.account.snapshot?.subscriptions?.find(
//           (item) => item.offerId === notesProMonthlyOfferId
//         )

//         expect(result.checkout.offerId).toBe(notesProMonthlyOfferId)
//         expect(result.transaction.id.length).toBeGreaterThan(0)
//         expect(activeOfferIds).toContain(notesProMonthlyOfferId)
//         expect(subscription?.status).toBe("active")
//         expect(result.account.entitlements?.benefits).toEqual(
//           expect.arrayContaining([
//             expect.objectContaining({ key: "note_sync_enabled", type: "feature_flag" }),
//             expect.objectContaining({ key: "note_items", type: "quota_limit", limit: 10_000 })
//           ])
//         )
//       }).pipe(Effect.provide(Live)),
//     { timeout: 300_000 }
//   )
// })
