import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingAuthorizationFleetFuelPriceData = Schema.Struct({
  gross_amount_decimal: Schema.NullOr(Schema.String),
})
export type IssuingAuthorizationFleetFuelPriceData = typeof IssuingAuthorizationFleetFuelPriceData.Type
