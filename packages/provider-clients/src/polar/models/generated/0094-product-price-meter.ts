import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ProductPriceMeter = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  unit: Schema.suspend((): typeof Models.MeterUnit => Models.MeterUnit),
  custom_label: Schema.optional(Schema.NullOr(Schema.String)),
  custom_multiplier: Schema.optional(Schema.NullOr(Schema.Number)),
})
export type ProductPriceMeter = typeof ProductPriceMeter.Type
