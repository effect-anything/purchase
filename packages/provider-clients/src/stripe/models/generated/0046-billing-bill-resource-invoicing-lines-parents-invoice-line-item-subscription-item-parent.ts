import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BillingBillResourceInvoicingLinesParentsInvoiceLineItemSubscriptionItemParent = Schema.Struct({
  invoice_item: Schema.NullOr(Schema.String),
  proration: Schema.Boolean,
  proration_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.BillingBillResourceInvoicingLinesCommonProrationDetails, any, any> =>
        Models.BillingBillResourceInvoicingLinesCommonProrationDetails as Schema.Schema<
          Models.BillingBillResourceInvoicingLinesCommonProrationDetails,
          any,
          any
        >
    )
  ),
  subscription: Schema.NullOr(Schema.String),
  subscription_item: Schema.String
})
export type BillingBillResourceInvoicingLinesParentsInvoiceLineItemSubscriptionItemParent =
  typeof BillingBillResourceInvoicingLinesParentsInvoiceLineItemSubscriptionItemParent.Type
