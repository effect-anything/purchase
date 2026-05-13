import { Paddle } from "@effect-x/purchase/paddle"
import { PaymentHarness } from "@effect-x/purchase/test"
import { PlatformConfigProvider } from "@effect/platform"
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { describe, it } from "@effect/vitest"
import { Effect, Layer, ConfigProvider } from "effect"

import { syncCatalog, prepareProvider } from "../../src/sync/config-service.ts"
import * as Harness from "../harness.ts"
// import { HttpApiTesting } from "./api-utils.ts"

// const DefaultConfig = Config.all({
//   appBaseUrl: Config.string("BASE_PUBLIC_URL"),
//   provider: Config.literal("paddle", "stripe")("PUBLIC_E2E_PROVIDER").pipe(Config.withDefault("paddle")),
//   paddleApiToken: Config.redacted("PADDLE_API_TOKEN"),
//   paddleEnvironment: Config.literal("sandbox", "production")("PADDLE_ENVIRONMENT").pipe(Config.withDefault("sandbox")),
//   paddleWebhookSecret: Config.redacted("PADDLE_WEBHOOK_TOKEN"),
//   webhookPath: Config.string("PUBLIC_E2E_WEBHOOK_PATH").pipe(Config.withDefault("/api/webhooks/paddle")),
//   headless: Config.boolean("PUBLIC_E2E_HEADLESS").pipe(Config.withDefault(true)),
//   userAgent: Config.string("PUBLIC_E2E_USER_AGENT").pipe(Config.withDefault("PurchaseSDK-E2E/1.0"))
// })

// Harness | Pay
const Live = PaymentHarness.make({ browser: { headless: true } }).pipe(
  Layer.provideMerge(Paddle.layer),
  Layer.provide(PlatformConfigProvider.layerDotEnv(".env")),
  Layer.provide(NodeContext.layer),
  Layer.orDie
)

// NodeRuntime.runMain(program.pipe(Effect.provide(Live)))

describe.skip("todo", () => {
  it.effect("pass", () =>
    Effect.gen(function* () {
      yield* Effect.logTrace("OK")

      // yield* Harness.setup()

      // yield* purchase.catalog.sync({})

      // const accountSession = yield* Harness.signUp({})
      // const accountOverview = yield* Harness.getAccount(accountSession)

      // Purchase
      // yield* Harness.checkout({ offerId: "notes:notes_pro_monthly", session: accountSession })
      // yield* Harness.purchaseSubscription({ session: accountSession, offerId: "notes:notes_pro_monthly" })
    }).pipe(
      Effect.provide(
        Live.pipe(
          Layer.provide(
            // unwrapEffect
            Layer.setConfigProvider(
              ConfigProvider.fromJson({
                BASE_PUBLIC_URL: ""
              })
            )
          ),
          Layer.provideMerge(HttpApiTesting)
        )
      )
    )
  )
})
