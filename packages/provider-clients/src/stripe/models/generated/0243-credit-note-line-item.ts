import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CreditNoteLineItem = Schema.Struct({
  amount: Schema.Number,
  description: Schema.NullOr(Schema.String),
  discount_amount: Schema.Number,
  discount_amounts: Schema.Array(Schema.suspend((): typeof Models.DiscountsResourceDiscountAmount => Models.DiscountsResourceDiscountAmount)),
  id: Schema.String,
  invoice_line_item: Schema.optional(Schema.String),
  livemode: Schema.Boolean,
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  object: Schema.Literal("credit_note_line_item"),
  pretax_credit_amounts: Schema.Array(Schema.suspend((): typeof Models.CreditNotesPretaxCreditAmount => Models.CreditNotesPretaxCreditAmount)),
  quantity: Schema.NullOr(Schema.Number),
  tax_rates: Schema.Array(Schema.suspend((): typeof Models.TaxRate => Models.TaxRate)),
  taxes: Schema.NullOr(Schema.Array(Schema.suspend((): typeof Models.BillingBillResourceInvoicingTaxesTax => Models.BillingBillResourceInvoicingTaxesTax))),
  type: Schema.Literal("custom_line_item", "invoice_line_item"),
  unit_amount: Schema.NullOr(Schema.Number),
  unit_amount_decimal: Schema.NullOr(Schema.String),
})
export type CreditNoteLineItem = typeof CreditNoteLineItem.Type
