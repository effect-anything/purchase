import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type BillingCreditBalanceTransaction = {
  readonly created: number
  readonly credit: Models.BillingCreditGrantsResourceBalanceCredit | null
  readonly credit_grant: string | Models.BillingCreditGrant
  readonly debit: Models.BillingCreditGrantsResourceBalanceDebit | null
  readonly effective_at: number
  readonly id: string
  readonly livemode: boolean
  readonly object: "billing.credit_balance_transaction"
  readonly test_clock: string | Models.TestHelpersTestClock | null
  readonly type: "credit" | "debit" | null
}

export const BillingCreditBalanceTransaction = Schema.Struct({
  created: Schema.Number,
  credit: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.BillingCreditGrantsResourceBalanceCredit, any, any> =>
        Models.BillingCreditGrantsResourceBalanceCredit as Schema.Schema<
          Models.BillingCreditGrantsResourceBalanceCredit,
          any,
          any
        >
    )
  ),
  credit_grant: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.BillingCreditGrant, any, any> =>
        Models.BillingCreditGrant as Schema.Schema<Models.BillingCreditGrant, any, any>
    )
  ),
  debit: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.BillingCreditGrantsResourceBalanceDebit, any, any> =>
        Models.BillingCreditGrantsResourceBalanceDebit as Schema.Schema<
          Models.BillingCreditGrantsResourceBalanceDebit,
          any,
          any
        >
    )
  ),
  effective_at: Schema.Number,
  id: Schema.String,
  livemode: Schema.Boolean,
  object: Schema.Literal("billing.credit_balance_transaction"),
  test_clock: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.TestHelpersTestClock, any, any> =>
          Models.TestHelpersTestClock as Schema.Schema<Models.TestHelpersTestClock, any, any>
      )
    )
  ),
  type: Schema.NullOr(Schema.Literal("credit", "debit"))
})
