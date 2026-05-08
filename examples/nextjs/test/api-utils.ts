import {
  Cookies,
  Headers,
  HttpApiClient,
  type HttpBody,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
  HttpLayerRouter
} from "@effect/platform"
import { Effect, Layer, Ref, Stream } from "effect"

import { HttpApiLive } from "../runtime.ts"
import { AppApi } from "../services/api/http-api.ts"

export class ApiClient extends Effect.Service<ApiClient>()("ApiClient", {
  effect: HttpApiClient.make(AppApi)
}) {}

const requestBody = (body: HttpBody.HttpBody): Effect.Effect<BodyInit | undefined> => {
  switch (body._tag) {
    case "Empty":
      return Effect.succeed(undefined)
    case "Raw":
      return Effect.succeed(body.body as BodyInit)
    case "Uint8Array":
      return Effect.succeed(body.body as any)
    case "FormData":
      return Effect.succeed(body.formData)
    case "Stream":
      return (body.stream as Stream.Stream<Uint8Array<ArrayBufferLike>, never, never>).pipe(
        Stream.runCollect,
        Effect.map((chunks) => new Blob(chunks as any))
      )
  }
}

const makeRequest = (request: HttpClientRequest.HttpClientRequest) =>
  Effect.map(requestBody(request.body), (body) => {
    const headers = new globalThis.Headers(Object.entries(request.headers))

    if (request.body.contentType && !Headers.has(request.headers, "content-type")) {
      headers.set("content-type", request.body.contentType)
    }

    if (request.body.contentLength && !Headers.has(request.headers, "content-length")) {
      headers.set("content-length", String(request.body.contentLength))
    }

    return new Request(new URL(request.url, "http://effect.test"), {
      body: body ?? null,
      headers,
      method: request.method
    })
  })

const InMemoryHttpClient = Layer.unwrapScoped(
  Effect.gen(function* () {
    const handler = HttpLayerRouter.toWebHandler(HttpApiLive)

    yield* Effect.addFinalizer(() => Effect.promise(() => handler.dispose()))

    const ref = yield* Ref.make(Cookies.empty)

    return Layer.succeed(
      HttpClient.HttpClient,
      HttpClient.make((request) =>
        Effect.gen(function* () {
          const webRequest = yield* makeRequest(request)
          const response = yield* Effect.promise(() => handler.handler(webRequest))

          return HttpClientResponse.fromWeb(request, response)
        })
      ).pipe(
        HttpClient.mapRequest((request) => request.pipe(HttpClientRequest.prependUrl("http://effect.test"))),
        HttpClient.withCookiesRef(ref)
      )
    )
  })
)

export const HttpApiTesting = ApiClient.Default.pipe(Layer.provide(InMemoryHttpClient), Layer.orDie)
