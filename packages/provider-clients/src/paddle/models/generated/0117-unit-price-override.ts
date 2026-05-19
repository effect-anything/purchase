import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const UnitPriceOverride = Schema.Struct({
  country_codes: Schema.Array(Schema.suspend(() => Models.CountryCode)),
  unit_price: Schema.suspend(() => Models.Money),
})
export type UnitPriceOverride = typeof UnitPriceOverride.Type
