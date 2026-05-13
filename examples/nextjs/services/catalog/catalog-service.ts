import type { PaymentProviderTag } from "@effect-x/purchase"
import type { CommercialCatalog } from "@effect-x/purchase/schema"

import { Context, Effect, Layer } from "effect"

import { PurchaseService } from "../purchase/purchase-service"

/**
 * Example app catalog service.
 */
export class CatalogService extends Context.Tag("CatalogService")<
  CatalogService,
  {
    /**
     * Active payment provider for the example app.
     */
    readonly activeProvider: PaymentProviderTag
    /**
     * Load the current commercial catalog.
     */
    readonly loadCatalog: () => Effect.Effect<CommercialCatalog, unknown>
  }
>() {
  static Default = Layer.effect(
    CatalogService,
    Effect.gen(function* () {
      const purchase = yield* PurchaseService

      // const sync = () => sdk.catalog.sync({ dryRun: false })

      const loadCatalog = Effect.fn(function* () {
        return yield* purchase.catalog.getCatalog()
      })

      return {
        activeProvider: purchase.provider._tag,
        loadCatalog
      } as const
    })
  )
}
