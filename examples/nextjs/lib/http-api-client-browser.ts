"use client"

import { HttpApiClient } from "@effect/platform"
import { BrowserHttpClient } from "@effect/platform-browser"
import * as Effect from "effect/Effect"

import { AppApi } from "./http-api.ts"

export const makeBrowserHttpApiClient = async () =>
  Effect.runPromise(
    Effect.gen(function* () {
      return yield* HttpApiClient.make(AppApi, {
        baseUrl: "/api"
      })
    }).pipe(Effect.provide(BrowserHttpClient.layerXMLHttpRequest))
  )
