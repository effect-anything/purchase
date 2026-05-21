import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type BillingBillResourceInvoicingParentsInvoiceParent = {
  readonly quote_details: Models.BillingBillResourceInvoicingParentsInvoiceQuoteParent | null
  readonly subscription_details: Models.BillingBillResourceInvoicingParentsInvoiceSubscriptionParent | null
  readonly type: "quote_details" | "subscription_details"
}

export const BillingBillResourceInvoicingParentsInvoiceParent = Schema.Struct({
  quote_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.BillingBillResourceInvoicingParentsInvoiceQuoteParent, any, any> =>
        Models.BillingBillResourceInvoicingParentsInvoiceQuoteParent as Schema.Schema<
          Models.BillingBillResourceInvoicingParentsInvoiceQuoteParent,
          any,
          any
        >
    )
  ),
  subscription_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.BillingBillResourceInvoicingParentsInvoiceSubscriptionParent, any, any> =>
        Models.BillingBillResourceInvoicingParentsInvoiceSubscriptionParent as Schema.Schema<
          Models.BillingBillResourceInvoicingParentsInvoiceSubscriptionParent,
          any,
          any
        >
    )
  ),
  type: Schema.Literal("quote_details", "subscription_details")
})
