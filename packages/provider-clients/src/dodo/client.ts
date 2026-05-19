import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"

import { makeProviderClientEffect, type ProviderClient } from "../core/client.ts"
import { DodoCredentials } from "./credentials.ts"
import { matchDodoError } from "./errors.ts"

export class DodoClient extends Context.Tag("@effect-x/purchase-provider-clients/DodoClient")<
  DodoClient,
  ProviderClient
>() {}

export const makeDodoClient = Effect.gen(function* () {
  const credentials = yield* DodoCredentials
  return yield* makeProviderClientEffect({
    provider: "dodo",
    baseUrl: credentials.apiBaseUrl,
    headers: {
      Authorization: `Bearer ${Redacted.value(credentials.apiKey)}`
    },
    matchError: ({ status, body, message }) => matchDodoError(status, body, message)
  })
})

export const DodoClientLayer = Layer.effect(DodoClient, makeDodoClient)
