import { Paddle } from "@effect-x/purchase"
import { Effect, Layer, Logger, LogLevel } from "effect"

import { DBLive } from "./db.ts"
import { Pay } from "./purchase.ts"
import { AccountService } from "./services/account/account-service.ts"
import { AuthService } from "./services/auth/auth-service.ts"
import { CatalogService } from "./services/catalog/catalog-service.ts"
import { CheckoutService } from "./services/checkout/checkout-service.ts"
import { CreditsService } from "./services/credits/credits-service.ts"
import { CustomerSyncService } from "./services/customer-sync-service.ts"
import { ProviderConfigService } from "./services/provider-config-service.ts"
import { WebhookService } from "./services/webhooks/webhook-service.ts"

// Stripe.layerConfig({
//   apiKey: Redacted.make(getEnvString("STRIPE_API_KEY") ?? ""),
//   webhookSecret: Redacted.make(getEnvString("STRIPE_WEBHOOK_SECRET") ?? ""),
//   environment: resolveEnvironment() === "production" ? "production" : "sandbox"
// })

export const PayLive = Pay.Paddle.pipe(
  // Paddle sandbox wiring mirrors the package README quick start: app code owns
  // secret lookup, then hands a configured provider layer to the SDK runtime.
  Layer.provide(Paddle.layer)
)

const CommerceSupportLive = Layer.mergeAll(CustomerSyncService.Default, ProviderConfigService.Default)

export const ServiceLive = Layer.mergeAll(
  AuthService.Default,
  AccountService.Default.pipe(Layer.provide(CommerceSupportLive)),
  CatalogService.Default,
  CheckoutService.Default.pipe(Layer.provide(CommerceSupportLive)),
  CreditsService.Default.pipe(Layer.provide(CommerceSupportLive)),
  WebhookService.Default
)

export const Live = Layer.mergeAll(ServiceLive).pipe(
  Layer.provide(PayLive),
  Layer.provideMerge(DBLive),
  Layer.provide(Logger.pretty),
  Layer.provide(Logger.minimumLogLevel(LogLevel.All)),
  Layer.tapErrorCause(Effect.logError),
  Layer.orDie
)
