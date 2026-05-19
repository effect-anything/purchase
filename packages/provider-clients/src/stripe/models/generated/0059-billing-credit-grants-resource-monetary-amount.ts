import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingCreditGrantsResourceMonetaryAmount = Schema.Struct({
  currency: Schema.String,
  value: Schema.Number,
})
export type BillingCreditGrantsResourceMonetaryAmount = typeof BillingCreditGrantsResourceMonetaryAmount.Type
