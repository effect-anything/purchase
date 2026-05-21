import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BillingCreditGrantsResourceApplicabilityConfig = Schema.Struct({
  scope: Schema.suspend(
    (): Schema.Schema<Models.BillingCreditGrantsResourceScope, any, any> =>
      Models.BillingCreditGrantsResourceScope as Schema.Schema<Models.BillingCreditGrantsResourceScope, any, any>
  )
})
export type BillingCreditGrantsResourceApplicabilityConfig = typeof BillingCreditGrantsResourceApplicabilityConfig.Type
