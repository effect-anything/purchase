import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"

import { makeProviderClientEffect, type ProviderClient } from "../core/client.ts"
import { LemonCredentials } from "./credentials.ts"
import { matchLemonError } from "./errors.ts"

export class LemonClient extends Context.Tag("@effect-x/purchase-provider-clients/LemonClient")<
  LemonClient,
  ProviderClient
>() {}

export const makeLemonClient = Effect.gen(function* () {
  const credentials = yield* LemonCredentials
  return yield* makeProviderClientEffect({
    provider: "lemon",
    baseUrl: credentials.apiBaseUrl,
    headers: {
      Authorization: `Bearer ${Redacted.value(credentials.apiKey)}`,
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json"
    },
    matchError: ({ status, body, message }) => matchLemonError(status, body, message)
  })
})

export const LemonClientLayer = Layer.effect(LemonClient, makeLemonClient)
