import { HttpApiScalar, HttpLayerRouter, HttpMiddleware, HttpServer, HttpServerResponse } from "@effect/platform"
import { Effect, Layer } from "effect"

import { AccountHttpApiLive } from "./services/account/http.ts"
import { AppApi } from "./services/api/http-api.ts"
import { AuthHttpLive } from "./services/auth/http.ts"
import { CatalogHttpLive } from "./services/catalog/http.ts"
import { CheckoutHttpLive } from "./services/checkout/http.ts"
import { CreditsHttpLive } from "./services/credits/http.ts"

const SimpleRoute = Layer.scopedDiscard(
  Effect.gen(function* () {
    const router = yield* HttpLayerRouter.HttpRouter
    // const auth = yield* Auth

    yield* router.add("GET", "/api/health", HttpServerResponse.text("ok"))

    yield* router.add(
      "*",
      "/api/auth/*",
      Effect.gen(function* () {
        return HttpServerResponse.empty()
        // const req = yield* HttpServerRequest.HttpServerRequest
        // const source = req.source as IncomingMessage
        // const url = new URL(req.url, `http://${req.headers.host}`)
        // const res = yield* Effect.promise((signal) => auth.handler(createRequest(source, url, signal)))
        // const responseBody = res.body
        // if (!responseBody) {
        //   return HttpServerResponse.empty({
        //     headers: res.headers,
        //     status: res.status,
        //     statusText: res.statusText
        //   })
        // }

        // const stream = Stream.fromReadableStream({
        //   evaluate: () => responseBody,
        //   onError: (error) => {
        //     console.error(error)
        //     return new Errors.InternalServerError()
        //   }
        // })
        // return HttpServerResponse.stream(stream, {
        //   headers: res.headers,
        //   status: res.status,
        //   statusText: res.statusText
        // })
      })
    )
  })
)
//.pipe(Layer.provide(Auth.Default))

const ApiLayers = Layer.mergeAll(AuthHttpLive, AccountHttpApiLive, CatalogHttpLive, CheckoutHttpLive, CreditsHttpLive)

const CorsMiddleware = HttpMiddleware.cors({})

const TracerDisabledMiddleware = HttpMiddleware.withTracerDisabledForUrls(["/api/health"])

const PublicApiRoutes = HttpLayerRouter.addHttpApi(AppApi, { openapiPath: "/api/openapi" }).pipe(
  Layer.merge(
    HttpApiScalar.layerHttpLayerRouter({
      api: AppApi,
      path: "/api/docs"
    })
  ),
  Layer.provide(ApiLayers),
  Layer.provide([HttpLayerRouter.middleware(CorsMiddleware).layer]),
  TracerDisabledMiddleware
)

export const AllRoutes = Layer.mergeAll(SimpleRoute, PublicApiRoutes).pipe(
  Layer.provide([HttpServer.layerContext, HttpLayerRouter.layer])
)
