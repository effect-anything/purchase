import type * as HttpClientError from "@effect/platform/HttpClientError"

import * as FetchHttpClient from "@effect/platform/FetchHttpClient"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

import type { ProductsModule, PurchasePlansModule } from "../dsl.ts"

import { buildCommercialCatalog, CatalogState } from "../core/catalog-builder.ts"
import { PayStorageAdapter, type PayStorageOverrides } from "../db.ts"
import { PaymentClient } from "../provider/client.ts"
import {
  CommercialCatalogSyncService,
  CommercialCatalogSyncServiceLayer,
  type CommercialCatalogSyncInput,
  type CommercialCatalogSyncResult
} from "./catalog-sync-service.ts"
import { PaddleProviderPrepareService, PaddleProviderPrepareServiceLayer } from "./paddle-provider-prepare.ts"
import {
  buildUnsupportedPrepareResult,
  type ProviderPrepareInput,
  type ProviderPrepareResult
} from "./provider-prepare.ts"

export type {
  CommercialCatalogSyncInput,
  CommercialCatalogSyncPlan,
  CommercialCatalogSyncPlanArchiveCandidate,
  CommercialCatalogSyncPlanLocalRow,
  CommercialCatalogSyncPlanPriceCreate,
  CommercialCatalogSyncPlanProductCreate,
  CommercialCatalogSyncPlanProviderRef,
  CommercialCatalogSyncPlanStaleRow,
  CommercialCatalogSyncResult
} from "./catalog-sync-service.ts"
export type {
  ProviderPrepareInput,
  ProviderPreparePlan,
  ProviderPreparePlanChange,
  ProviderPrepareResult
} from "./provider-prepare.ts"

export { formatPrepareResult } from "./provider-prepare.ts"

export class PurchaseConfigService extends Context.Tag("@pay/core/PurchaseConfigService")<
  PurchaseConfigService,
  {
    readonly syncCatalog: (
      input?: CommercialCatalogSyncInput | undefined
    ) => Effect.Effect<CommercialCatalogSyncResult, unknown>
    readonly prepareProvider: (
      input?: ProviderPrepareInput | undefined
    ) => Effect.Effect<ProviderPrepareResult, HttpClientError.HttpClientError>
  }
>() {}

export const PurchaseConfigServiceLayer = Layer.effect(
  PurchaseConfigService,
  Effect.gen(function* () {
    const catalogSync = yield* CommercialCatalogSyncService
    const provider = yield* PaymentClient
    const paddleProviderPrepare = yield* Effect.serviceOption(PaddleProviderPrepareService)

    const syncCatalog = (input?: CommercialCatalogSyncInput | undefined) => catalogSync.sync(input)

    const prepareProvider = (input: ProviderPrepareInput = { environment: "sandbox" }) =>
      provider._tag === "paddle" && paddleProviderPrepare._tag === "Some"
        ? paddleProviderPrepare.value.prepare(input)
        : Effect.succeed(buildUnsupportedPrepareResult(provider._tag, input))

    return PurchaseConfigService.of({ syncCatalog, prepareProvider })
  })
)

export const PurchaseConfigLayer = (input: {
  readonly plans: PurchasePlansModule | undefined
  readonly products: ProductsModule | undefined
  readonly storageOverrides?: PayStorageOverrides | undefined
}) => {
  const catalogStateLive = Layer.effect(
    CatalogState,
    buildCommercialCatalog({
      plans: input.plans,
      products: input.products
    }).pipe(Effect.map((catalog) => ({ catalog })))
  )

  const catalogSyncLive = CommercialCatalogSyncServiceLayer(input).pipe(
    Layer.provide(catalogStateLive),
    Layer.provideMerge(PayStorageAdapter.make(input.storageOverrides))
  )

  return PurchaseConfigServiceLayer.pipe(
    Layer.provide(catalogSyncLive),
    Layer.provideMerge(PaddleProviderPrepareServiceLayer),
    Layer.provide(FetchHttpClient.layer)
  )
}

export const syncCatalog = (input?: CommercialCatalogSyncInput | undefined) =>
  Effect.flatMap(PurchaseConfigService, (service) => service.syncCatalog(input))

export const prepareProvider = (input?: ProviderPrepareInput | undefined) =>
  Effect.flatMap(PurchaseConfigService, (service) => service.prepareProvider(input))
