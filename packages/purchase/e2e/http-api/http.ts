import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"

import {
  AuthenticationRequired,
  CreditsConflict,
  MissingOfferId,
  ProviderNotConfigured,
  AccountOverviewSchema,
  AuthApiResponse,
  CatalogApiResponseSchema,
  CheckoutStartApiResponseSchema,
  CheckoutStartPayloadSchema,
  ConsumeCreditsApiResponseSchema,
  ConsumeCreditsPayloadSchema
} from "./domain.ts"

export const AccountApiResponseSchema = Schema.Struct({
  environment: Schema.String,
  provider: Schema.String,
  ...AccountOverviewSchema.fields
})

export const AppApi = HttpApi.make("purchase-nextjs")
  .add(HttpApiGroup.make("auth").add(HttpApiEndpoint.get("get", "/auth").addSuccess(AuthApiResponse)))
  .add(HttpApiGroup.make("catalog").add(HttpApiEndpoint.get("get", "/catalog").addSuccess(CatalogApiResponseSchema)))
  .add(
    HttpApiGroup.make("account").add(
      HttpApiEndpoint.get("get", "/me/account")
        .addSuccess(AccountApiResponseSchema)
        .addError(AuthenticationRequired, { status: 401 })
    )
  )
  .add(
    HttpApiGroup.make("checkout").add(
      HttpApiEndpoint.post("start", "/checkout/start")
        .setPayload(CheckoutStartPayloadSchema)
        .addSuccess(CheckoutStartApiResponseSchema)
        .addError(AuthenticationRequired, { status: 401 })
        .addError(ProviderNotConfigured, { status: 400 })
        .addError(MissingOfferId, { status: 400 })
    )
  )
  .add(
    HttpApiGroup.make("credits").add(
      HttpApiEndpoint.post("consume", "/me/credits/consume")
        .setPayload(ConsumeCreditsPayloadSchema)
        .addSuccess(ConsumeCreditsApiResponseSchema)
        .addError(AuthenticationRequired, { status: 401 })
        .addError(CreditsConflict, { status: 409 })
    )
  )
  .prefix("/api")

export type AppApi = typeof AppApi
