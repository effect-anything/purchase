import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerBalanceTransaction = Schema.Struct({
  amount: Schema.Number,
  checkout_session: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.CheckoutSession => Models.CheckoutSession))),
  created: Schema.Number,
  credit_note: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.CreditNote => Models.CreditNote))),
  currency: Schema.String,
  customer: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Customer => Models.Customer)),
  customer_account: Schema.NullOr(Schema.String),
  description: Schema.NullOr(Schema.String),
  ending_balance: Schema.Number,
  id: Schema.String,
  invoice: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Invoice => Models.Invoice))),
  livemode: Schema.Boolean,
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  object: Schema.Literal("customer_balance_transaction"),
  type: Schema.Literal("adjustment", "applied_to_invoice", "checkout_session_subscription_payment", "checkout_session_subscription_payment_canceled", "credit_note", "initial", "invoice_overpaid", "invoice_too_large", "invoice_too_small", "migration", "unapplied_from_invoice", "unspent_receiver_credit"),
})
export type CustomerBalanceTransaction = typeof CustomerBalanceTransaction.Type
