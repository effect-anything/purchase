import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingCreditBalanceTransaction = Schema.Struct({
  created: Schema.Number,
  credit: Schema.NullOr(Schema.suspend((): typeof Models.BillingCreditGrantsResourceBalanceCredit => Models.BillingCreditGrantsResourceBalanceCredit)),
  credit_grant: Schema.Union(Schema.String, Schema.suspend((): typeof Models.BillingCreditGrant => Models.BillingCreditGrant)),
  debit: Schema.NullOr(Schema.suspend((): typeof Models.BillingCreditGrantsResourceBalanceDebit => Models.BillingCreditGrantsResourceBalanceDebit)),
  effective_at: Schema.Number,
  id: Schema.String,
  livemode: Schema.Boolean,
  object: Schema.Literal("billing.credit_balance_transaction"),
  test_clock: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.TestHelpersTestClock => Models.TestHelpersTestClock))),
  type: Schema.NullOr(Schema.Literal("credit", "debit")),
})
export type BillingCreditBalanceTransaction = typeof BillingCreditBalanceTransaction.Type
