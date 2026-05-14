import { HttpApiBuilder, HttpServerRequest, HttpLayerRouter, HttpApi } from "@effect/platform"
import { Effect, Layer } from "effect"

import { CommercialPay } from "../commercial-catalog.ts"
import { AuthenticationRequired } from "./domain.ts"
import { AppApi } from "./http.ts"

const CatalogHttpLive = HttpApiBuilder.group(AppApi, "catalog", (handlers) =>
  handlers.handle("get", () =>
    Effect.gen(function* () {
      const purchase = yield* CommercialPay
      return {} as any
    })
  )
)

const AccountHttpApiLive = HttpApiBuilder.group(AppApi, "account", (handlers) =>
  handlers.handle("get", () =>
    Effect.gen(function* () {
      return {} as any
    })
  )
)

const CheckoutHttpLive = HttpApiBuilder.group(AppApi, "checkout", (handlers) =>
  handlers.handle("start", ({ payload }) =>
    Effect.gen(function* () {
      return {} as any
    })
  )
)

const CreditsHttpLive = HttpApiBuilder.group(AppApi, "credits", (handlers) =>
  handlers.handle("consume", ({ payload }) =>
    Effect.gen(function* () {
      return {} as any
    })
  )
)

const ApiLayers = Layer.mergeAll(AccountHttpApiLive, CatalogHttpLive, CheckoutHttpLive, CreditsHttpLive)

const PublicApiRoutes = HttpLayerRouter.addHttpApi(AppApi, { openapiPath: "/api/docs/openapi.json" }).pipe(
  Layer.provide(ApiLayers)
)

const AllRoutes = Layer.mergeAll(PublicApiRoutes)

export const HttpRouterLive = HttpLayerRouter.serve(AllRoutes)
