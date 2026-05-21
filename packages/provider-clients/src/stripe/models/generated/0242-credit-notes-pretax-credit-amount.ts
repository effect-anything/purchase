import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CreditNotesPretaxCreditAmount = Schema.Struct({
  amount: Schema.Number,
  credit_balance_transaction: Schema.optional(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.BillingCreditBalanceTransaction, any, any> =>
          Models.BillingCreditBalanceTransaction as Schema.Schema<Models.BillingCreditBalanceTransaction, any, any>
      )
    )
  ),
  discount: Schema.optional(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Discount, any, any> => Models.Discount as Schema.Schema<Models.Discount, any, any>
      ),
      Schema.suspend(
        (): Schema.Schema<Models.DeletedDiscount, any, any> =>
          Models.DeletedDiscount as Schema.Schema<Models.DeletedDiscount, any, any>
      )
    )
  ),
  type: Schema.Literal("credit_balance_transaction", "discount")
})
export type CreditNotesPretaxCreditAmount = typeof CreditNotesPretaxCreditAmount.Type
