import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform"

import {
  AccountApiResponse,
  AuthSignUpApiResponse,
  AuthSignUpPayload,
  AuthenticationRequired,
  CatalogApiResponse,
  CheckoutStartApiResponse,
  CheckoutStartPayload,
  ConsumeCreditsApiResponse,
  ConsumeCreditsPayload,
  CreditsConflict,
  MissingOfferId,
  ProviderNotConfigured
} from "./domain.ts"

export const AppApi = HttpApi.make("purchase-e2e")
  .add(
    HttpApiGroup.make("auth").add(
      HttpApiEndpoint.post("signUpEmail", "/auth/sign-up/email")
        .setPayload(AuthSignUpPayload)
        .addSuccess(AuthSignUpApiResponse)
    )
  )
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
        .addError(CreditsConflict, { status: 409 })
    )
  )
  .prefix("/api")

export type AppApi = typeof AppApi
