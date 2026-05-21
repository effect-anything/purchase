import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BillingBillResourceInvoicingLinesParentsInvoiceLineItemParent = Schema.Struct({
  invoice_item_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.BillingBillResourceInvoicingLinesParentsInvoiceLineItemInvoiceItemParent, any, any> =>
        Models.BillingBillResourceInvoicingLinesParentsInvoiceLineItemInvoiceItemParent as Schema.Schema<
          Models.BillingBillResourceInvoicingLinesParentsInvoiceLineItemInvoiceItemParent,
          any,
          any
        >
    )
  ),
  subscription_item_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<
        Models.BillingBillResourceInvoicingLinesParentsInvoiceLineItemSubscriptionItemParent,
        any,
        any
      > =>
        Models.BillingBillResourceInvoicingLinesParentsInvoiceLineItemSubscriptionItemParent as Schema.Schema<
          Models.BillingBillResourceInvoicingLinesParentsInvoiceLineItemSubscriptionItemParent,
          any,
          any
        >
    )
  ),
  type: Schema.Literal("invoice_item_details", "subscription_item_details")
})
export type BillingBillResourceInvoicingLinesParentsInvoiceLineItemParent =
  typeof BillingBillResourceInvoicingLinesParentsInvoiceLineItemParent.Type
