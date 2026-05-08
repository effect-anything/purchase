import { HttpApiClient, HttpClient, HttpClientRequest } from "@effect/platform"
import { Effect } from "effect"
import { headers as nextHeaders } from "next/headers"

import { AppApi } from "./http-api"

export const makeServerHttpApiClient = async () => {
  const headers = await nextHeaders()
  const host = headers.get("x-forwarded-host") ?? headers.get("host") ?? "localhost:3000"
  const proto = headers.get("x-forwarded-proto") ?? "http"
  const baseUrl = `${proto}://${host}`
  const headerRecord = Object.fromEntries(headers.entries())

  return Effect.runPromise(
    Effect.gen(function* () {
      const httpClient = (yield* HttpClient.HttpClient).pipe(
        HttpClient.mapRequest((request) =>
          request.pipe(HttpClientRequest.prependUrl(baseUrl), HttpClientRequest.setHeaders(headerRecord))
        )
      )

      return yield* HttpApiClient.make(AppApi, {
        baseUrl,
        transformClient: () => httpClient
      })
    }).pipe(Effect.provide(HttpClient.layer))
  )
}
