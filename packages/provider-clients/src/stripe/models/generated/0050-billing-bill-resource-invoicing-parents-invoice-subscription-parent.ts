import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingBillResourceInvoicingParentsInvoiceSubscriptionParent = Schema.Struct({
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  subscription: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Subscription => Models.Subscription)),
  subscription_proration_date: Schema.optional(Schema.Number),
})
export type BillingBillResourceInvoicingParentsInvoiceSubscriptionParent = typeof BillingBillResourceInvoicingParentsInvoiceSubscriptionParent.Type
