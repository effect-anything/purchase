import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BillingBillResourceInvoicingLinesCommonCreditedItems = Schema.Struct({
  invoice: Schema.String,
  invoice_line_items: Schema.Array(Schema.String)
})
export type BillingBillResourceInvoicingLinesCommonCreditedItems =
  typeof BillingBillResourceInvoicingLinesCommonCreditedItems.Type
