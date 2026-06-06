import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

import type { ProductsModule, PurchasePlan, PurchasePlansModule } from "../dsl.ts"

import { buildCommercialCatalog, CatalogState } from "../core/catalog-state.ts"
import { PurchaseStorageAdapter, type PurchaseStorageOverrides } from "../db.ts"
import { PaddleVendorPrepareServiceLayer } from "../paddle/internal/paddle-vendor-prepare.ts"
import {
  CommercialCatalogSyncService,
  type CommercialCatalogSyncInput,
  type CommercialCatalogSyncResult
} from "./sync.ts"

export class PurchaseConfigService extends Context.Tag("@effect-x/purchase/sync/PurchaseConfigService")<
  PurchaseConfigService,
  {
    readonly syncCatalog: (input?: CommercialCatalogSyncInput | undefined) => Effect.Effect<CommercialCatalogSyncResult>
  }
>() {
  static Default = Layer.effect(
    PurchaseConfigService,
    Effect.gen(function* () {
      const catalogSync = yield* CommercialCatalogSyncService

      const syncCatalog = (input?: CommercialCatalogSyncInput | undefined) => catalogSync.sync(input)

      return PurchaseConfigService.of({ syncCatalog })
    })
  )
}

/**
 * @deprecated
 */
export const PurchaseConfigLayer = (input: {
  readonly plans: ReadonlyArray<PurchasePlan>
  readonly products: ProductsModule | undefined
  readonly storageOverrides?: PurchaseStorageOverrides | undefined
}) => {
  const catalogSyncLive = CommercialCatalogSyncService.make(input).pipe(
    Layer.provideMerge(PurchaseStorageAdapter.make(input.storageOverrides))
  )

  return PurchaseConfigService.Default.pipe(
    Layer.provide(catalogSyncLive)
    // Layer.provideMerge(PaddleVendorPrepareServiceLayer),
    // Layer.provide(FetchHttpClient.layer)
  )
}

/**
 * @deprecated
 */
export const syncCatalog = (input?: CommercialCatalogSyncInput | undefined) =>
  Effect.flatMap(PurchaseConfigService, (service) => service.syncCatalog(input))
