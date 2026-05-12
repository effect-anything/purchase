import { CustomerCommercialSnapshot } from "@effect-x/purchase"
import { CommercialCatalog, CustomerEntitlementSnapshot } from "@effect-x/purchase/schema"
import { Schema } from "effect"

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

export type AuthenticatedUser = {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly workspaceSlug: string
  readonly creditsUsed: number
}

export const AuthenticatedUserSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
  workspaceSlug: Schema.String,
  creditsUsed: Schema.Number
})

export const AuthSessionSummarySchema = Schema.Struct({
  user: AuthenticatedUserSchema
})

export const AuthApiResponse = Schema.Struct({
  session: Schema.NullOr(AuthSessionSummarySchema)
})

export const AccountActivitySchema = Schema.Struct({
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

export const AccountOverviewSchema = Schema.Struct({
  customer: AuthenticatedUserSchema.pipe(Schema.omit("creditsUsed")),
  snapshot: CustomerCommercialSnapshot,
  entitlements: CustomerEntitlementSnapshot,
  activity: AccountActivitySchema
})
export const AccountApiResponseSchema = Schema.Struct({
  environment: Schema.String,
  provider: Schema.String,
  ...AccountOverviewSchema.fields
})

export const CatalogApiResponseSchema = Schema.Struct({
  environment: Schema.String,
  provider: Schema.String,
  catalog: CommercialCatalog
})

export const CheckoutStartPayloadSchema = Schema.Struct({
  offerId: Schema.String
})

export const CheckoutStartResultSchema = Schema.Struct({
  offerId: Schema.String,
  intentId: Schema.String,
  sessionId: Schema.String,
  url: Schema.NullOr(Schema.String)
})

export type CheckoutStartResult = typeof CheckoutStartResultSchema.Type

export const CheckoutStartApiResponseSchema = Schema.Struct({
  environment: Schema.String,
  provider: Schema.String,
  checkout: CheckoutStartResultSchema
})

export const ConsumeCreditsPayloadSchema = Schema.Struct({
  amount: Schema.optional(Schema.Number),
  reason: Schema.optional(Schema.String)
})

export const CreditWalletSchema = Schema.Struct({
  available: Schema.Number,
  acquired: Schema.Number,
  consumed: Schema.Number
})

export type CreditWallet = typeof CreditWalletSchema.Type

export const ConsumeCreditsApiResponseSchema = Schema.Struct({
  wallet: CreditWalletSchema
})
