import type { CommercialCatalog } from "@effect-x/purchase/schema"

import { Effect } from "effect"

import * as Next from "../../lib/nextjs/server-effect.ts"
import { CatalogService } from "./catalog-service.ts"

export const syncCatalogProjection: () => Promise<void> = Next.serverFunction(
  Effect.fn(function* () {
    const catalog = yield* CatalogService
    return yield* catalog.sync()
  })
)

export const loadCommercialCatalog: () => Promise<CommercialCatalog> = Next.cachedServerFunction(
  Effect.fn(function* () {
    const catalog = yield* CatalogService
    return yield* catalog.loadCatalog()
  })
)
