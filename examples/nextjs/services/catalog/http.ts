import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"

import { AppApi } from "../api/http-api.ts"
import { purchaseEnvironment, purchaseProvider } from "../purchase-domain.ts"
import { CatalogService } from "./catalog-service.ts"

export const CatalogHttpLive = HttpApiBuilder.group(AppApi, "catalog", (handlers) =>
  handlers.handle("get", () =>
    Effect.gen(function* () {
      const catalog = yield* CatalogService

      return {
        environment: purchaseEnvironment,
        provider: purchaseProvider,
        catalog: yield* catalog.loadCatalog().pipe(Effect.orDie)
      }
    })
  )
)
