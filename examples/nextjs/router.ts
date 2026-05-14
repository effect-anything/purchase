import { isPaymentProvider } from "@effect-x/purchase"
import {
  HttpApiScalar,
  HttpLayerRouter,
  HttpMiddleware,
  HttpRouter,
  HttpServer,
  HttpServerRequest,
  HttpServerResponse
} from "@effect/platform"
import { Effect, Layer, Stream } from "effect"

import { AccountHttpApiLive } from "./services/account/http.ts"
import { AppApi } from "./services/api/http-api.ts"
import { AuthService } from "./services/auth/auth-service.ts"
import { AuthHttpLive } from "./services/auth/http.ts"
import { CatalogHttpLive } from "./services/catalog/http.ts"
import { CheckoutHttpLive } from "./services/checkout/http.ts"
import { CreditsHttpLive } from "./services/credits/http.ts"
import { WebhookService } from "./services/webhooks/webhook-service.ts"

const SimpleRoute = Layer.scopedDiscard(
  Effect.gen(function* () {
    const router = yield* HttpLayerRouter.HttpRouter
    const auth = yield* AuthService

    yield* router.add("GET", "/api/health", HttpServerResponse.text("ok"))

    yield* router.add(
      "POST",
      "/api/webhooks/:provider",
      Effect.gen(function* () {
        const params = yield* HttpRouter.params
        const provider = params.provider

        if (!isPaymentProvider(provider)) {
          return HttpServerResponse.unsafeJson({ error: "Unsupported webhook provider" }, { status: 404 })
        }

        const req = yield* HttpServerRequest.HttpServerRequest
        const signature = req.headers["paddle-signature"] ?? req.headers["stripe-signature"]

        if (!signature) {
          return HttpServerResponse.unsafeJson({ error: "Missing webhook signature" }, { status: 400 })
        }

        const body = yield* req.text
        const webhooks = yield* WebhookService
        const result = yield* webhooks.process({ provider, body, signature })

        return HttpServerResponse.unsafeJson(result)
      }).pipe(
        Effect.catchAllCause((cause) =>
          Effect.logError(cause).pipe(
            Effect.as(HttpServerResponse.unsafeJson({ error: "Webhook processing failed" }, { status: 400 }))
          )
        )
      )
    )

    yield* router.add(
      "*",
      "/api/auth/*",
      Effect.gen(function* () {
        const req = yield* HttpServerRequest.HttpServerRequest
        const webRequest = yield* HttpServerRequest.toWeb(req).pipe(Effect.orDie)
        const res = yield* auth.handler(webRequest).pipe(Effect.orDie)
        const responseBody = res.body

        if (!responseBody) {
          return HttpServerResponse.empty({
            headers: res.headers,
            status: res.status,
            statusText: res.statusText
          })
        }

        return HttpServerResponse.stream(
          Stream.fromReadableStream({
            evaluate: () => responseBody,
            onError: (error) => error
          }),
          {
            headers: res.headers,
            status: res.status,
            statusText: res.statusText
          }
        )
      })
    )
  })
)

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
