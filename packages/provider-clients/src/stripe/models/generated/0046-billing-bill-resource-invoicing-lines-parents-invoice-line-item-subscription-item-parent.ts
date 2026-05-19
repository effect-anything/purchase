import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingBillResourceInvoicingLinesParentsInvoiceLineItemSubscriptionItemParent = Schema.Struct({
  invoice_item: Schema.NullOr(Schema.String),
  proration: Schema.Boolean,
  proration_details: Schema.NullOr(Schema.suspend((): typeof Models.BillingBillResourceInvoicingLinesCommonProrationDetails => Models.BillingBillResourceInvoicingLinesCommonProrationDetails)),
  subscription: Schema.NullOr(Schema.String),
  subscription_item: Schema.String,
})
export type BillingBillResourceInvoicingLinesParentsInvoiceLineItemSubscriptionItemParent = typeof BillingBillResourceInvoicingLinesParentsInvoiceLineItemSubscriptionItemParent.Type
