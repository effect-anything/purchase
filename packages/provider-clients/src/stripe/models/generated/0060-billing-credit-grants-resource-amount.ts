import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BillingCreditGrantsResourceAmount = Schema.Struct({
  monetary: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.BillingCreditGrantsResourceMonetaryAmount, any, any> =>
        Models.BillingCreditGrantsResourceMonetaryAmount as Schema.Schema<
          Models.BillingCreditGrantsResourceMonetaryAmount,
          any,
          any
        >
    )
  ),
  type: Schema.Literal("monetary")
})
export type BillingCreditGrantsResourceAmount = typeof BillingCreditGrantsResourceAmount.Type
