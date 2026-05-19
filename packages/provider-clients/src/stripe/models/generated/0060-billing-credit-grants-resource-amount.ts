import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingCreditGrantsResourceAmount = Schema.Struct({
  monetary: Schema.NullOr(Schema.suspend((): typeof Models.BillingCreditGrantsResourceMonetaryAmount => Models.BillingCreditGrantsResourceMonetaryAmount)),
  type: Schema.Literal("monetary"),
})
export type BillingCreditGrantsResourceAmount = typeof BillingCreditGrantsResourceAmount.Type
