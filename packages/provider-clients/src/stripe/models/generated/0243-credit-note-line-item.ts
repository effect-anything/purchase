import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CreditNoteLineItem = Schema.Struct({
  amount: Schema.Number,
  description: Schema.NullOr(Schema.String),
  discount_amount: Schema.Number,
  discount_amounts: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.DiscountsResourceDiscountAmount, any, any> =>
        Models.DiscountsResourceDiscountAmount as Schema.Schema<Models.DiscountsResourceDiscountAmount, any, any>
    )
  ),
  id: Schema.String,
  invoice_line_item: Schema.optional(Schema.String),
  livemode: Schema.Boolean,
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  object: Schema.Literal("credit_note_line_item"),
  pretax_credit_amounts: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.CreditNotesPretaxCreditAmount, any, any> =>
        Models.CreditNotesPretaxCreditAmount as Schema.Schema<Models.CreditNotesPretaxCreditAmount, any, any>
    )
  ),
  quantity: Schema.NullOr(Schema.Number),
  tax_rates: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.TaxRate, any, any> => Models.TaxRate as Schema.Schema<Models.TaxRate, any, any>
    )
  ),
  taxes: Schema.NullOr(
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
  type: Schema.Literal("custom_line_item", "invoice_line_item"),
  unit_amount: Schema.NullOr(Schema.Number),
  unit_amount_decimal: Schema.NullOr(Schema.String)
})
export type CreditNoteLineItem = typeof CreditNoteLineItem.Type
