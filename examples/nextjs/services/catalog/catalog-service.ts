import type { PaymentProviderTag } from "@effect-x/purchase"
import type { CommercialCatalog } from "@effect-x/purchase/schema"

import { Context, Effect, Layer } from "effect"

import { Pay } from "../../purchase.ts"

const activeProvider: PaymentProviderTag = "paddle"

export class CatalogService extends Context.Tag("CatalogService")<
  CatalogService,
  {
    readonly activeProvider: PaymentProviderTag
    readonly sync: () => Effect.Effect<void, unknown>
    readonly loadCatalog: () => Effect.Effect<CommercialCatalog, unknown>
  }
>() {
  static Default = Layer.effect(
    CatalogService,
    Effect.gen(function* () {
      const sdk = yield* Pay

      const sync = () => sdk.catalog.sync({ dryRun: false })

      const loadCatalog = Effect.fn(function* () {
        return yield* sdk.catalog.getCatalog()
      })

      return {
        activeProvider,
        sync,
        loadCatalog
      } as const
    })
  )
}
