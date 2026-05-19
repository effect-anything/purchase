import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingCreditGrantsResourceApplicablePrice = Schema.Struct({
  id: Schema.NullOr(Schema.String),
})
export type BillingCreditGrantsResourceApplicablePrice = typeof BillingCreditGrantsResourceApplicablePrice.Type
