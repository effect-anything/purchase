import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"

import { makeProviderClientEffect, type ProviderClient } from "../core/client.ts"
import { PolarCredentials } from "./credentials.ts"
import { matchPolarError } from "./errors.ts"

export class PolarClient extends Context.Tag("@effect-x/purchase-provider-clients/PolarClient")<
  PolarClient,
  ProviderClient
>() {}

export const makePolarClient = Effect.gen(function* () {
  const credentials = yield* PolarCredentials
  return yield* makeProviderClientEffect({
    provider: "polar",
    baseUrl: credentials.apiBaseUrl,
    headers: {
      Authorization: `Bearer ${Redacted.value(credentials.accessToken)}`
    },
    matchError: ({ status, body, message }) => matchPolarError(status, body, message)
  })
})

export const PolarClientLayer = Layer.effect(PolarClient, makePolarClient)
