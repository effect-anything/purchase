import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type BillingCreditGrantsResourceBalanceDebit = {
  readonly amount: Models.BillingCreditGrantsResourceAmount
  readonly credits_applied: Models.BillingCreditGrantsResourceBalanceCreditsApplied | null
  readonly type: "credits_applied" | "credits_expired" | "credits_voided"
}

export const BillingCreditGrantsResourceBalanceDebit = Schema.Struct({
  amount: Schema.suspend(
    (): Schema.Schema<Models.BillingCreditGrantsResourceAmount, any, any> =>
      Models.BillingCreditGrantsResourceAmount as Schema.Schema<Models.BillingCreditGrantsResourceAmount, any, any>
  ),
  credits_applied: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.BillingCreditGrantsResourceBalanceCreditsApplied, any, any> =>
        Models.BillingCreditGrantsResourceBalanceCreditsApplied as Schema.Schema<
          Models.BillingCreditGrantsResourceBalanceCreditsApplied,
          any,
          any
        >
    )
  ),
  type: Schema.Literal("credits_applied", "credits_expired", "credits_voided")
})
