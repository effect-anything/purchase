import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type CustomerBalanceTransaction = {
  readonly amount: number
  readonly checkout_session: string | Models.CheckoutSession | null
  readonly created: number
  readonly credit_note: string | Models.CreditNote | null
  readonly currency: string
  readonly customer: string | Models.Customer
  readonly customer_account: string | null
  readonly description: string | null
  readonly ending_balance: number
  readonly id: string
  readonly invoice: string | Models.Invoice | null
  readonly livemode: boolean
  readonly metadata: Readonly<Record<string, string>> | null
  readonly object: "customer_balance_transaction"
  readonly type:
    | "adjustment"
    | "applied_to_invoice"
    | "checkout_session_subscription_payment"
    | "checkout_session_subscription_payment_canceled"
    | "credit_note"
    | "initial"
    | "invoice_overpaid"
    | "invoice_too_large"
    | "invoice_too_small"
    | "migration"
    | "unapplied_from_invoice"
    | "unspent_receiver_credit"
}

export const CustomerBalanceTransaction = Schema.Struct({
  amount: Schema.Number,
  checkout_session: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.CheckoutSession, any, any> =>
          Models.CheckoutSession as Schema.Schema<Models.CheckoutSession, any, any>
      )
    )
  ),
  created: Schema.Number,
  credit_note: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.CreditNote, any, any> =>
          Models.CreditNote as Schema.Schema<Models.CreditNote, any, any>
      )
    )
  ),
  currency: Schema.String,
  customer: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Customer, any, any> => Models.Customer as Schema.Schema<Models.Customer, any, any>
    )
  ),
  customer_account: Schema.NullOr(Schema.String),
  description: Schema.NullOr(Schema.String),
  ending_balance: Schema.Number,
  id: Schema.String,
  invoice: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Invoice, any, any> => Models.Invoice as Schema.Schema<Models.Invoice, any, any>
      )
    )
  ),
  livemode: Schema.Boolean,
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  object: Schema.Literal("customer_balance_transaction"),
  type: Schema.Literal(
    "adjustment",
    "applied_to_invoice",
    "checkout_session_subscription_payment",
    "checkout_session_subscription_payment_canceled",
    "credit_note",
    "initial",
    "invoice_overpaid",
    "invoice_too_large",
    "invoice_too_small",
    "migration",
    "unapplied_from_invoice",
    "unspent_receiver_credit"
  )
})
