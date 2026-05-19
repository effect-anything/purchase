import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TaxRateFlatAmount = Schema.Struct({
  amount: Schema.Number,
  currency: Schema.String,
})
export type TaxRateFlatAmount = typeof TaxRateFlatAmount.Type
