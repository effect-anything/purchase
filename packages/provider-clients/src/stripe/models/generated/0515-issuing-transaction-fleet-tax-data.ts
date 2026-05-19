import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingTransactionFleetTaxData = Schema.Struct({
  local_amount_decimal: Schema.NullOr(Schema.String),
  national_amount_decimal: Schema.NullOr(Schema.String),
})
export type IssuingTransactionFleetTaxData = typeof IssuingTransactionFleetTaxData.Type
