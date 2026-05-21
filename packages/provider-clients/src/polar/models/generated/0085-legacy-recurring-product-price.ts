import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const LegacyRecurringProductPrice = Schema.Union(
  Schema.suspend(
    (): Schema.Schema<Models.LegacyRecurringProductPriceFixed, any, any> =>
      Models.LegacyRecurringProductPriceFixed as Schema.Schema<Models.LegacyRecurringProductPriceFixed, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.LegacyRecurringProductPriceCustom, any, any> =>
      Models.LegacyRecurringProductPriceCustom as Schema.Schema<Models.LegacyRecurringProductPriceCustom, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.LegacyRecurringProductPriceFree, any, any> =>
      Models.LegacyRecurringProductPriceFree as Schema.Schema<Models.LegacyRecurringProductPriceFree, any, any>
  )
)
export type LegacyRecurringProductPrice = typeof LegacyRecurringProductPrice.Type
