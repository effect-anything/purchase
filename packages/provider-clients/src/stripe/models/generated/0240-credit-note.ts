import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type CreditNote = {
  readonly amount: number
  readonly amount_shipping: number
  readonly created: number
  readonly currency: string
  readonly customer: string | Models.Customer | Models.DeletedCustomer
  readonly customer_account: string | null
  readonly customer_balance_transaction: string | Models.CustomerBalanceTransaction | null
  readonly discount_amount: number
  readonly discount_amounts: ReadonlyArray<Models.DiscountsResourceDiscountAmount>
  readonly effective_at: number | null
  readonly id: string
  readonly invoice: string | Models.Invoice
  readonly lines: {
    readonly data: ReadonlyArray<Models.CreditNoteLineItem>
    readonly has_more: boolean
    readonly object: "list"
    readonly url: string
  }
  readonly livemode: boolean
  readonly memo: string | null
  readonly metadata: Readonly<Record<string, string>> | null
  readonly number: string
  readonly object: "credit_note"
  readonly out_of_band_amount: number | null
  readonly pdf: string
  readonly post_payment_amount: number
  readonly pre_payment_amount: number
  readonly pretax_credit_amounts: ReadonlyArray<Models.CreditNotesPretaxCreditAmount>
  readonly reason: "duplicate" | "fraudulent" | "order_change" | "product_unsatisfactory" | null
  readonly refunds: ReadonlyArray<Models.CreditNoteRefund>
  readonly shipping_cost: Models.InvoicesResourceShippingCost | null
  readonly status: "issued" | "void"
  readonly subtotal: number
  readonly subtotal_excluding_tax: number | null
  readonly total: number
  readonly total_excluding_tax: number | null
  readonly total_taxes: ReadonlyArray<Models.BillingBillResourceInvoicingTaxesTax> | null
  readonly type: "mixed" | "post_payment" | "pre_payment"
  readonly voided_at: number | null
}

export const CreditNote = Schema.Struct({
  amount: Schema.Number,
  amount_shipping: Schema.Number,
  created: Schema.Number,
  currency: Schema.String,
  customer: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Customer, any, any> => Models.Customer as Schema.Schema<Models.Customer, any, any>
    ),
    Schema.suspend(
      (): Schema.Schema<Models.DeletedCustomer, any, any> =>
        Models.DeletedCustomer as Schema.Schema<Models.DeletedCustomer, any, any>
    )
  ),
  customer_account: Schema.NullOr(Schema.String),
  customer_balance_transaction: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.CustomerBalanceTransaction, any, any> =>
          Models.CustomerBalanceTransaction as Schema.Schema<Models.CustomerBalanceTransaction, any, any>
      )
    )
  ),
  discount_amount: Schema.Number,
  discount_amounts: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.DiscountsResourceDiscountAmount, any, any> =>
        Models.DiscountsResourceDiscountAmount as Schema.Schema<Models.DiscountsResourceDiscountAmount, any, any>
    )
  ),
  effective_at: Schema.NullOr(Schema.Number),
  id: Schema.String,
  invoice: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Invoice, any, any> => Models.Invoice as Schema.Schema<Models.Invoice, any, any>
    )
  ),
  lines: Schema.Struct({
    data: Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.CreditNoteLineItem, any, any> =>
          Models.CreditNoteLineItem as Schema.Schema<Models.CreditNoteLineItem, any, any>
      )
    ),
    has_more: Schema.Boolean,
    object: Schema.Literal("list"),
    url: Schema.String
  }),
  livemode: Schema.Boolean,
  memo: Schema.NullOr(Schema.String),
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  number: Schema.String,
  object: Schema.Literal("credit_note"),
  out_of_band_amount: Schema.NullOr(Schema.Number),
  pdf: Schema.String,
  post_payment_amount: Schema.Number,
  pre_payment_amount: Schema.Number,
  pretax_credit_amounts: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.CreditNotesPretaxCreditAmount, any, any> =>
        Models.CreditNotesPretaxCreditAmount as Schema.Schema<Models.CreditNotesPretaxCreditAmount, any, any>
    )
  ),
  reason: Schema.NullOr(Schema.Literal("duplicate", "fraudulent", "order_change", "product_unsatisfactory")),
  refunds: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.CreditNoteRefund, any, any> =>
        Models.CreditNoteRefund as Schema.Schema<Models.CreditNoteRefund, any, any>
    )
  ),
  shipping_cost: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.InvoicesResourceShippingCost, any, any> =>
        Models.InvoicesResourceShippingCost as Schema.Schema<Models.InvoicesResourceShippingCost, any, any>
    )
  ),
  status: Schema.Literal("issued", "void"),
  subtotal: Schema.Number,
  subtotal_excluding_tax: Schema.NullOr(Schema.Number),
  total: Schema.Number,
  total_excluding_tax: Schema.NullOr(Schema.Number),
  total_taxes: Schema.NullOr(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.BillingBillResourceInvoicingTaxesTax, any, any> =>
          Models.BillingBillResourceInvoicingTaxesTax as Schema.Schema<
            Models.BillingBillResourceInvoicingTaxesTax,
            any,
            any
          >
      )
    )
  ),
  type: Schema.Literal("mixed", "post_payment", "pre_payment"),
  voided_at: Schema.NullOr(Schema.Number)
})
