import { HttpApiBuilder } from "@effect/platform"
import { Effect, Layer } from "effect"

import { AppApi } from "../api/http-api.ts"

export const CatalogHttpLive = HttpApiBuilder.group(AppApi, "catalog", (handlers) =>
  handlers.handle("get", () =>
    Effect.gen(function* () {
      // const catalog = yield* loadCommercialCatalog()

      return {
        // environment: getPurchaseEnvironment(),
        // provider: getActiveProvider(),
        // catalog
      } as any
    })
  )
)
