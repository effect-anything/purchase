import { CommercialCatalog, CustomerCommercialSnapshot, CustomerEntitlementSnapshot } from "@effect-x/purchase/schema"
import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"

import { AuthenticationRequired, MissingOfferId, ProviderNotConfigured } from "../../errors.ts"

export const CheckoutStartPayload = Schema.Struct({
  offerId: Schema.String
})

export const ConsumeCreditsPayload = Schema.Struct({
  amount: Schema.optional(Schema.Number),
  reason: Schema.optional(Schema.String)
})

export const CatalogApiResponse = Schema.Struct({
  environment: Schema.String,
  provider: Schema.String,
  catalog: CommercialCatalog
})

export const AccountApiResponse = Schema.Struct({
  environment: Schema.String,
  provider: Schema.String,
  customer: Schema.Struct({
    id: Schema.String,
    email: Schema.String,
    name: Schema.String,
    workspaceSlug: Schema.String
  }),
  snapshot: CustomerCommercialSnapshot,
  entitlements: CustomerEntitlementSnapshot,
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

export const CheckoutStartApiResponse = Schema.Struct({
  environment: Schema.String,
  provider: Schema.String,
  checkout: Schema.Struct({
    offerId: Schema.String,
    intentId: Schema.String,
    sessionId: Schema.String,
    url: Schema.NullOr(Schema.String)
  })
})

export const ConsumeCreditsApiResponse = Schema.Struct({
  wallet: Schema.Struct({
    available: Schema.Number,
    acquired: Schema.Number,
    consumed: Schema.Number
  })
})

export const AppApi = HttpApi.make("purchase-nextjs")
  .add(HttpApiGroup.make("auth").add(HttpApiEndpoint.get("get", "/auth")))
  .add(HttpApiGroup.make("catalog").add(HttpApiEndpoint.get("get", "/catalog").addSuccess(CatalogApiResponse)))
  .add(
    HttpApiGroup.make("account").add(
      HttpApiEndpoint.get("get", "/me/account")
        .addSuccess(AccountApiResponse)
        .addError(AuthenticationRequired, { status: 401 })
    )
  )
  .add(
    HttpApiGroup.make("checkout").add(
      HttpApiEndpoint.post("start", "/checkout/start")
        .setPayload(CheckoutStartPayload)
        .addSuccess(CheckoutStartApiResponse)
        .addError(AuthenticationRequired, { status: 401 })
        .addError(ProviderNotConfigured, { status: 400 })
        .addError(MissingOfferId, { status: 400 })
    )
  )
  .add(
    HttpApiGroup.make("credits").add(
      HttpApiEndpoint.post("consume", "/me/credits/consume")
        .setPayload(ConsumeCreditsPayload)
        .addSuccess(ConsumeCreditsApiResponse)
        .addError(AuthenticationRequired, { status: 401 })
    )
  )
  .prefix("/api")

export type AppApi = typeof AppApi
