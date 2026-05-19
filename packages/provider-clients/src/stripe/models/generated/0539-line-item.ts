import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const LineItem = Schema.Struct({
  amount: Schema.Number,
  currency: Schema.String,
  description: Schema.NullOr(Schema.String),
  discount_amounts: Schema.NullOr(Schema.Array(Schema.suspend((): typeof Models.DiscountsResourceDiscountAmount => Models.DiscountsResourceDiscountAmount))),
  discountable: Schema.Boolean,
  discounts: Schema.Array(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Discount => Models.Discount))),
  id: Schema.String,
  invoice: Schema.NullOr(Schema.String),
  livemode: Schema.Boolean,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  object: Schema.Literal("line_item"),
  parent: Schema.NullOr(Schema.suspend((): typeof Models.BillingBillResourceInvoicingLinesParentsInvoiceLineItemParent => Models.BillingBillResourceInvoicingLinesParentsInvoiceLineItemParent)),
  period: Schema.suspend((): typeof Models.InvoiceLineItemPeriod => Models.InvoiceLineItemPeriod),
  pretax_credit_amounts: Schema.NullOr(Schema.Array(Schema.suspend((): typeof Models.InvoicesResourcePretaxCreditAmount => Models.InvoicesResourcePretaxCreditAmount))),
  pricing: Schema.NullOr(Schema.suspend((): typeof Models.BillingBillResourceInvoicingPricingPricing => Models.BillingBillResourceInvoicingPricingPricing)),
  quantity: Schema.NullOr(Schema.Number),
  quantity_decimal: Schema.NullOr(Schema.String),
  subscription: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Subscription => Models.Subscription))),
  subtotal: Schema.Number,
  taxes: Schema.NullOr(Schema.Array(Schema.suspend((): typeof Models.BillingBillResourceInvoicingTaxesTax => Models.BillingBillResourceInvoicingTaxesTax))),
})
export type LineItem = typeof LineItem.Type
