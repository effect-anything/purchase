import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const UnitPriceOverride = Schema.Struct({
  country_codes: Schema.Array(Schema.suspend((): Schema.Schema<Models.CountryCode> => Models.CountryCode)),
  unit_price: Schema.suspend((): Schema.Schema<Models.Money> => Models.Money)
})
export type UnitPriceOverride = typeof UnitPriceOverride.Type
