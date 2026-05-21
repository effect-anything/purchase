import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const UnitPriceOverride = Schema.Struct({
  country_codes: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.CountryCode, any, any> =>
        Models.CountryCode as Schema.Schema<Models.CountryCode, any, any>
    )
  ),
  unit_price: Schema.suspend(
    (): Schema.Schema<Models.Money, any, any> => Models.Money as Schema.Schema<Models.Money, any, any>
  )
})
export type UnitPriceOverride = typeof UnitPriceOverride.Type
