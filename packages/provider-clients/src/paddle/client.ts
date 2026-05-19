import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Redacted from "effect/Redacted"

import { makeProviderClientEffect, type ProviderClient } from "../core/client.ts"
import { PaddleCredentials } from "./credentials.ts"
import { matchPaddleError } from "./errors.ts"

export class PaddleClient extends Context.Tag("@effect-x/purchase-provider-clients/PaddleClient")<
  PaddleClient,
  ProviderClient
>() {}

export const makePaddleClient = Effect.gen(function* () {
  const credentials = yield* PaddleCredentials
  return yield* makeProviderClientEffect({
    provider: "paddle",
    baseUrl: credentials.apiBaseUrl,
    headers: {
      Authorization: `Bearer ${Redacted.value(credentials.apiToken)}`
    },
    matchError: ({ status, body, message }) => matchPaddleError(status, body, message)
  })
})

export const PaddleClientLayer = Layer.effect(PaddleClient, makePaddleClient)
