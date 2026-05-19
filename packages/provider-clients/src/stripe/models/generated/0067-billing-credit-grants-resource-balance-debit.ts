import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingCreditGrantsResourceBalanceDebit = Schema.Struct({
  amount: Schema.suspend((): typeof Models.BillingCreditGrantsResourceAmount => Models.BillingCreditGrantsResourceAmount),
  credits_applied: Schema.NullOr(Schema.suspend((): typeof Models.BillingCreditGrantsResourceBalanceCreditsApplied => Models.BillingCreditGrantsResourceBalanceCreditsApplied)),
  type: Schema.Literal("credits_applied", "credits_expired", "credits_voided"),
})
export type BillingCreditGrantsResourceBalanceDebit = typeof BillingCreditGrantsResourceBalanceDebit.Type
