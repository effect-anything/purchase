import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"

import { makeProviderClientEffect, type ProviderClient } from "../core/client.ts"
import { StripeCredentials } from "./credentials.ts"
import { matchStripeError } from "./errors.ts"

export class StripeClient extends Context.Tag("@effect-x/purchase-provider-clients/StripeClient")<
  StripeClient,
  ProviderClient
>() {}

export const makeStripeClient = Effect.gen(function* () {
  const credentials = yield* StripeCredentials
  return yield* makeProviderClientEffect({
    provider: "stripe",
    baseUrl: credentials.apiBaseUrl,
    headers: {
      Authorization: `Bearer ${Redacted.value(credentials.apiKey)}`,
      "Stripe-Version": credentials.apiVersion
    },
    matchError: ({ status, body, message }) => matchStripeError(status, body, message)
  })
})

export const StripeClientLayer = Layer.effect(StripeClient, makeStripeClient)
