import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingTransactionFleetNonFuelPriceData = Schema.Struct({
  gross_amount_decimal: Schema.NullOr(Schema.String),
})
export type IssuingTransactionFleetNonFuelPriceData = typeof IssuingTransactionFleetNonFuelPriceData.Type
