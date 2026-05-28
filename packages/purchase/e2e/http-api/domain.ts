import { PaymentEnvironmentTag, PaymentProviderTag } from "@effect-x/purchase/provider"
import { CheckoutMode, CommercialCatalog } from "@effect-x/purchase/schema"
import { Context, Schema } from "effect"

export class AuthenticationRequired extends Schema.TaggedError<AuthenticationRequired>()("AuthenticationRequired", {
  message: Schema.String
}) {}

export class ProviderNotConfigured extends Schema.TaggedError<ProviderNotConfigured>()("ProviderNotConfigured", {
  message: Schema.String
}) {}

export class CreditsConflict extends Schema.TaggedError<CreditsConflict>()("CreditsConflict", {
  workflow: Schema.String,
  message: Schema.String
}) {}

export class MissingOfferId extends Schema.TaggedError<MissingOfferId>()("MissingOfferId", {
  message: Schema.String
}) {}

export class WebhookProcessingFailed extends Schema.TaggedError<WebhookProcessingFailed>()("WebhookProcessingFailed", {
  message: Schema.String
}) {}

export const AuthenticatedUser = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
  workspaceSlug: Schema.String,
  creditsUsed: Schema.Number
})
export type AuthenticatedUser = typeof AuthenticatedUser.Type

export class CurrentUser extends Context.Tag("CurrentUser")<CurrentUser, AuthenticatedUser>() {}

export const AuthSignUpPayload = Schema.Struct({
  email: Schema.optional(Schema.String),
  password: Schema.optional(Schema.String),
  name: Schema.optional(Schema.String)
})

export const AuthSignUpApiResponse = Schema.Struct({
  user: AuthenticatedUser
})

export const AccountApiResponse = Schema.Struct({
  environment: PaymentEnvironmentTag,
  provider: PaymentProviderTag,
  user: AuthenticatedUser,
  snapshot: Schema.Struct({
    activeOfferIds: Schema.Array(Schema.String),
    subscriptions: Schema.Array(
      Schema.Struct({
        id: Schema.String,
        status: Schema.String,
        offerId: Schema.String
      })
    ),
    purchases: Schema.Array(
      Schema.Struct({
        id: Schema.String,
        status: Schema.String,
        offerId: Schema.String
      })
    ),
    wallets: Schema.Array(
      Schema.Struct({
        id: Schema.String,
        productId: Schema.String,
        available: Schema.Number,
        acquired: Schema.Number,
        consumed: Schema.Number,
        refunded: Schema.Number
      })
    )
  }),
  entitlements: Schema.Struct({
    benefits: Schema.Array(
      Schema.Struct({
        key: Schema.String,
        type: Schema.String,
        enabled: Schema.optional(Schema.Boolean),
        limit: Schema.optional(Schema.Number)
      })
    )
  }),
  activity: Schema.Struct({
    checkoutIntents: Schema.Array(
      Schema.Struct({
        id: Schema.String,
        offerId: Schema.String,
        status: Schema.String,
        updatedAt: Schema.String
      })
    ),
    events: Schema.Array(
      Schema.Struct({
        id: Schema.String,
        provider: Schema.String,
        kind: Schema.String,
        offerId: Schema.NullOr(Schema.String),
        occurredAt: Schema.String
      })
    ),
    creditLedger: Schema.Array(
      Schema.Struct({
        id: Schema.String,
        productId: Schema.String,
        amount: Schema.Number,
        direction: Schema.String,
        reason: Schema.NullOr(Schema.String),
        createdAt: Schema.String
      })
    )
  })
})

export const CatalogApiResponse = Schema.Struct({
  environment: PaymentEnvironmentTag,
  provider: PaymentProviderTag,
  catalog: CommercialCatalog
})

export const CheckoutStartPayload = Schema.Struct({
  offerId: Schema.String,
  runId: Schema.optional(Schema.String)
})

export const CheckoutStartResult = Schema.Struct({
  offerId: Schema.String,
  intentId: Schema.String,
  sessionId: Schema.String,
  mode: CheckoutMode,
  url: Schema.NullOr(Schema.String)
})

export const CheckoutStartApiResponse = Schema.Struct({
  environment: PaymentEnvironmentTag,
  provider: PaymentProviderTag,
  checkout: CheckoutStartResult
})

export const ConsumeCreditsPayload = Schema.Struct({
  amount: Schema.optional(Schema.Number),
  reason: Schema.optional(Schema.String)
})

export const CreditWalletSchema = Schema.Struct({
  available: Schema.Number,
  acquired: Schema.Number,
  consumed: Schema.Number
})

export const ConsumeCreditsApiResponse = Schema.Struct({
  wallet: CreditWalletSchema
})
