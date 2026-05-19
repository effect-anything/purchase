import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingCreditGrantsResourceScope = Schema.Struct({
  price_type: Schema.optional(Schema.Literal("metered")),
  prices: Schema.optional(Schema.Array(Schema.suspend((): typeof Models.BillingCreditGrantsResourceApplicablePrice => Models.BillingCreditGrantsResourceApplicablePrice))),
})
export type BillingCreditGrantsResourceScope = typeof BillingCreditGrantsResourceScope.Type
