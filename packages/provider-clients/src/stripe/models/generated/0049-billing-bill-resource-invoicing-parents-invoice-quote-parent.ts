import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingBillResourceInvoicingParentsInvoiceQuoteParent = Schema.Struct({
  quote: Schema.String,
})
export type BillingBillResourceInvoicingParentsInvoiceQuoteParent = typeof BillingBillResourceInvoicingParentsInvoiceQuoteParent.Type
