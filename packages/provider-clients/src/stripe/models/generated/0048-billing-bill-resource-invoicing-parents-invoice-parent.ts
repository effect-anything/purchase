import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingBillResourceInvoicingParentsInvoiceParent = Schema.Struct({
  quote_details: Schema.NullOr(Schema.suspend((): typeof Models.BillingBillResourceInvoicingParentsInvoiceQuoteParent => Models.BillingBillResourceInvoicingParentsInvoiceQuoteParent)),
  subscription_details: Schema.NullOr(Schema.suspend((): typeof Models.BillingBillResourceInvoicingParentsInvoiceSubscriptionParent => Models.BillingBillResourceInvoicingParentsInvoiceSubscriptionParent)),
  type: Schema.Literal("quote_details", "subscription_details"),
})
export type BillingBillResourceInvoicingParentsInvoiceParent = typeof BillingBillResourceInvoicingParentsInvoiceParent.Type
