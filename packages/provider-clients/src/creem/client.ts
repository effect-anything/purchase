import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"

import { makeProviderClientEffect, type ProviderClient } from "../core/client.ts"
import { CreemCredentials } from "./credentials.ts"
import { matchCreemError } from "./errors.ts"

export class CreemClient extends Context.Tag("@effect-x/purchase-provider-clients/CreemClient")<
  CreemClient,
  ProviderClient
>() {}

export const makeCreemClient = Effect.gen(function* () {
  const credentials = yield* CreemCredentials
  return yield* makeProviderClientEffect({
    provider: "creem",
    baseUrl: credentials.apiBaseUrl,
    headers: {
      "x-api-key": Redacted.value(credentials.apiKey)
    },
    matchError: ({ status, body, message }) => matchCreemError(status, body, message)
  })
})

export const CreemClientLayer = Layer.effect(CreemClient, makeCreemClient)
