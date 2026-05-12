import { PaymentHarness } from "@effect-x/purchase/test"
import { PlatformConfigProvider } from "@effect/platform"
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { Effect, Layer } from "effect"

import { PurchaseService } from "../services/purchase/purchase-service"
import * as Harness from "./harness"

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

const program = Effect.gen(function* () {
  yield* Effect.logTrace("OK")
  const purchase = yield* PurchaseService

  // yield* Harness.setup()

  // yield* purchase.catalog.sync({})

  const accountSession = yield* Harness.signUp({})
  const accountOverview = yield* Harness.getAccount(accountSession)

  // Purchase
  // yield* Harness.checkout({ offerId: "notes:notes_pro_monthly", session: accountSession })
  // yield* Harness.purchaseSubscription({ session: accountSession, offerId: "notes:notes_pro_monthly" })
})

// Harness | Pay
const Live = PaymentHarness.make({ browser: { headless: true } }).pipe(
  Layer.provideMerge(PurchaseService.Paddle),
  Layer.provide(PlatformConfigProvider.layerDotEnv(".env")),
  Layer.provide(NodeContext.layer),
  Layer.orDie
)

// NodeRuntime.runMain(program.pipe(Effect.provide(Live)))
