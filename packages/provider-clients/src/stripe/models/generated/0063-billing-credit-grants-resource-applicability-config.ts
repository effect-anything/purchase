import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingCreditGrantsResourceApplicabilityConfig = Schema.Struct({
  scope: Schema.suspend((): typeof Models.BillingCreditGrantsResourceScope => Models.BillingCreditGrantsResourceScope),
})
export type BillingCreditGrantsResourceApplicabilityConfig = typeof BillingCreditGrantsResourceApplicabilityConfig.Type
