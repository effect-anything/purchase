import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingTransactionFuelData = Schema.Struct({
  industry_product_code: Schema.NullOr(Schema.String),
  quantity_decimal: Schema.NullOr(Schema.String),
  type: Schema.String,
  unit: Schema.String,
  unit_cost_decimal: Schema.String,
})
export type IssuingTransactionFuelData = typeof IssuingTransactionFuelData.Type
