import { Paddle } from "@effect-x/purchase/paddle"
import { Effect, Layer, Redacted, Logger, LogLevel } from "effect"

import { DBLive } from "./db.ts"
import { Pay } from "./purchase.ts"
import { AuthService } from "./services/auth/auth-service.ts"

// Stripe.layerConfig({
//   apiKey: Redacted.make(getEnvString("STRIPE_API_KEY") ?? ""),
//   webhookSecret: Redacted.make(getEnvString("STRIPE_WEBHOOK_SECRET") ?? ""),
//   environment: resolveEnvironment() === "production" ? "production" : "sandbox"
// })

export const PayLive = Pay.Layer.pipe(
  Layer.provide(
    Paddle.layerConfig({
      apiToken: Redacted.make("PADDLE_API_TOKEN"),
      webhookToken: Redacted.make("PADDLE_WEBHOOK_TOKEN"),
      environment: "sandbox"
    })
  )
)

export const ServiceLive = Layer.mergeAll(
  AuthService.Default,
  Layer.scopedDiscard(
    Effect.gen(function* () {
      yield* Effect.logInfo("make")
      yield* Effect.addFinalizer(() =>
        Effect.gen(function* () {
          yield* Effect.logTrace("Layer finalizer")
        })
      )
    })
  )
)

export const Live = ServiceLive.pipe(
  Layer.provide(PayLive),
  Layer.provideMerge(DBLive),
  Layer.provide(Logger.pretty),
  Layer.provide(Logger.minimumLogLevel(LogLevel.All)),
  Layer.tapErrorCause(Effect.logError),
  Layer.orDie
)
