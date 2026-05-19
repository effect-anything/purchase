import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingAuthorizationFuelData = Schema.Struct({
  industry_product_code: Schema.NullOr(Schema.String),
  quantity_decimal: Schema.NullOr(Schema.String),
  type: Schema.NullOr(Schema.Literal("diesel", "other", "unleaded_plus", "unleaded_regular", "unleaded_super")),
  unit: Schema.NullOr(Schema.Literal("charging_minute", "imperial_gallon", "kilogram", "kilowatt_hour", "liter", "other", "pound", "us_gallon")),
  unit_cost_decimal: Schema.NullOr(Schema.String),
})
export type IssuingAuthorizationFuelData = typeof IssuingAuthorizationFuelData.Type
