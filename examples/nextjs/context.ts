import { Effect, Layer, Logger, LogLevel } from "effect"

import { DBLive } from "./db.ts"
import { AccountService } from "./services/account/account-service.ts"
import { AuthService } from "./services/auth/auth-service.ts"
import { CatalogService } from "./services/catalog/catalog-service.ts"
import { CheckoutService } from "./services/checkout/checkout-service.ts"
import { CreditsService } from "./services/credits/credits-service.ts"
import { CustomerSyncService } from "./services/customer-sync-service.ts"
import { ProviderConfigService } from "./services/provider-config-service.ts"
import { PurchaseService } from "./services/purchase/purchase-service.ts"
import { WebhookService } from "./services/webhooks/webhook-service.ts"

const CommerceSupportLive = Layer.mergeAll(CustomerSyncService.Default, ProviderConfigService.Default)

export const ServiceLive = Layer.mergeAll(
  AuthService.Default,
  AccountService.Default.pipe(Layer.provide([CommerceSupportLive, PurchaseService.Paddle])),
  CatalogService.Default.pipe(Layer.provide([PurchaseService.Paddle])),
  CheckoutService.Default.pipe(Layer.provide([CommerceSupportLive, PurchaseService.Paddle])),
  CreditsService.Default.pipe(Layer.provide([CommerceSupportLive, PurchaseService.Paddle])),
  WebhookService.Default.pipe(Layer.provide([PurchaseService.Paddle]))
)

export const Live = Layer.mergeAll(ServiceLive).pipe(
  Layer.provideMerge(DBLive),
  Layer.provide(Logger.pretty),
  Layer.provide(Logger.minimumLogLevel(LogLevel.All)),
  Layer.tapErrorCause(Effect.logError),
  Layer.orDie
)
