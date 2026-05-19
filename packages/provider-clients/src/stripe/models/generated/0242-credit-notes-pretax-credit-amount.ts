import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CreditNotesPretaxCreditAmount = Schema.Struct({
  amount: Schema.Number,
  credit_balance_transaction: Schema.optional(Schema.Union(Schema.String, Schema.suspend((): typeof Models.BillingCreditBalanceTransaction => Models.BillingCreditBalanceTransaction))),
  discount: Schema.optional(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Discount => Models.Discount), Schema.suspend((): typeof Models.DeletedDiscount => Models.DeletedDiscount))),
  type: Schema.Literal("credit_balance_transaction", "discount"),
})
export type CreditNotesPretaxCreditAmount = typeof CreditNotesPretaxCreditAmount.Type
