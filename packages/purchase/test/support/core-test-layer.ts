import { Effect, Layer } from "effect"

import type { ProductsModule, PurchasePlansModule } from "../../src/dsl.ts"

import { PurchaseConfigLayer } from "../../src/catalog/config-service.ts"
import { buildCommercialCatalog, CatalogState } from "../../src/core/catalog-builder.ts"
import { CommercialCatalogServiceLayer } from "../../src/core/catalog-service.ts"
import { CommercialProjectionServiceLayer } from "../../src/core/projection-service.ts"
import { CommercialStateStoreLayer } from "../../src/core/state-store.ts"
import { CommercialWorkflowServiceLayer } from "../../src/core/workflow-service.ts"
import { CommercialWorkflowStoreLayer } from "../../src/core/workflow-store.ts"
import { PurchaseStorageAdapter } from "../../src/db.ts"
import { testPlans, testProducts } from "./test-catalog.ts"

const testPlansModule = testPlans as PurchasePlansModule
const testProductsModule = testProducts as ProductsModule

const catalogStateLive = Layer.effect(
  CatalogState,
  buildCommercialCatalog({
    plans: testPlansModule,
    products: testProductsModule
  }).pipe(Effect.map((catalog) => ({ catalog })))
)

const catalogServiceLive = CommercialCatalogServiceLayer.pipe(Layer.provide(catalogStateLive))
const catalogSyncLive = PurchaseConfigLayer({ plans: testPlansModule, products: testProductsModule })

const projectionServiceLive = CommercialProjectionServiceLayer.pipe(Layer.provide(catalogServiceLive))
const workflowStoreLive = CommercialWorkflowStoreLayer
const stateStoreLive = CommercialStateStoreLayer.pipe(Layer.provide(projectionServiceLive))
const workflowServiceLive = CommercialWorkflowServiceLayer.pipe(
  Layer.provide(catalogServiceLive),
  Layer.provide(workflowStoreLive),
  Layer.provide(projectionServiceLive)
)

export const CorePayTestLayer = Layer.mergeAll(
  catalogServiceLive,
  catalogSyncLive,
  projectionServiceLive,
  workflowStoreLive,
  stateStoreLive,
  workflowServiceLive
).pipe(Layer.provideMerge(PurchaseStorageAdapter.make()))
