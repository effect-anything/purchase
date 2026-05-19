import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingBillResourceInvoicingLinesParentsInvoiceLineItemParent = Schema.Struct({
  invoice_item_details: Schema.NullOr(Schema.suspend((): typeof Models.BillingBillResourceInvoicingLinesParentsInvoiceLineItemInvoiceItemParent => Models.BillingBillResourceInvoicingLinesParentsInvoiceLineItemInvoiceItemParent)),
  subscription_item_details: Schema.NullOr(Schema.suspend((): typeof Models.BillingBillResourceInvoicingLinesParentsInvoiceLineItemSubscriptionItemParent => Models.BillingBillResourceInvoicingLinesParentsInvoiceLineItemSubscriptionItemParent)),
  type: Schema.Literal("invoice_item_details", "subscription_item_details"),
})
export type BillingBillResourceInvoicingLinesParentsInvoiceLineItemParent = typeof BillingBillResourceInvoicingLinesParentsInvoiceLineItemParent.Type
