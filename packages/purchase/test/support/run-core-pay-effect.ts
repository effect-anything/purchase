import { Effect, Layer } from "effect"

import type { ProductsModule, PurchasePlansModule } from "../../src/dsl.ts"
import type { PaymentProvider } from "../../src/provider/client.ts"

import { PurchaseConfigLayer } from "../../src/catalog/config-service.ts"
import { CommercialCatalogServiceLayer } from "../../src/core/catalog-service.ts"
import { CatalogState } from "../../src/core/catalog-state.ts"
import { CommercialProjectionServiceLayer } from "../../src/core/projection-service.ts"
import { CommercialStateStoreLayer } from "../../src/core/state-store.ts"
import { CommercialWorkflowServiceLayer } from "../../src/core/workflow-service.ts"
import { CommercialWorkflowStoreLayer } from "../../src/core/workflow-store.ts"
import { PurchaseStorageAdapter } from "../../src/db.ts"
import { setupPayTables, SqlitePayHarnessLive } from "./sqlite-pay-harness.ts"
import { testPlans, testProducts } from "./test-catalog.ts"

const testPlansModule = testPlans as PurchasePlansModule
const testProductsModule = testProducts as ProductsModule

const catalogStateLive = CatalogState.make({
  plans: testPlansModule,
  products: testProductsModule
})

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

const CorePayTestLayer = Layer.mergeAll(
  catalogServiceLive,
  catalogSyncLive,
  projectionServiceLive,
  workflowStoreLive,
  stateStoreLive,
  workflowServiceLive
).pipe(Layer.provideMerge(PurchaseStorageAdapter.make()))

export const runCorePayEffect = <A, E, R>(effect: Effect.Effect<A, E, R>, paymentLayer: Layer.Layer<PaymentProvider>) =>
  setupPayTables.pipe(
    Effect.flatMap(() => effect),
    Effect.provide(Layer.provideMerge(CorePayTestLayer, Layer.mergeAll(paymentLayer, SqlitePayHarnessLive)))
  )
