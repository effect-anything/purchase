import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingBillResourceInvoicingLinesCommonProrationDetails = Schema.Struct({
  credited_items: Schema.NullOr(Schema.suspend((): typeof Models.BillingBillResourceInvoicingLinesCommonCreditedItems => Models.BillingBillResourceInvoicingLinesCommonCreditedItems)),
})
export type BillingBillResourceInvoicingLinesCommonProrationDetails = typeof BillingBillResourceInvoicingLinesCommonProrationDetails.Type
