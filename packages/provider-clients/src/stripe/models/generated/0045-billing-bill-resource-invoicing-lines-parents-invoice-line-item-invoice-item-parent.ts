import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingBillResourceInvoicingLinesParentsInvoiceLineItemInvoiceItemParent = Schema.Struct({
  invoice_item: Schema.String,
  proration: Schema.Boolean,
  proration_details: Schema.NullOr(Schema.suspend((): typeof Models.BillingBillResourceInvoicingLinesCommonProrationDetails => Models.BillingBillResourceInvoicingLinesCommonProrationDetails)),
  subscription: Schema.NullOr(Schema.String),
})
export type BillingBillResourceInvoicingLinesParentsInvoiceLineItemInvoiceItemParent = typeof BillingBillResourceInvoicingLinesParentsInvoiceLineItemInvoiceItemParent.Type
