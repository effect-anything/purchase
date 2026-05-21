import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type BillingBillResourceInvoicingParentsInvoiceSubscriptionParent = {
  readonly metadata: Readonly<Record<string, string>> | null
  readonly subscription: string | Models.Subscription
  readonly subscription_proration_date?: number
}

export const BillingBillResourceInvoicingParentsInvoiceSubscriptionParent = Schema.Struct({
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  subscription: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Subscription, any, any> =>
        Models.Subscription as Schema.Schema<Models.Subscription, any, any>
    )
  ),
  subscription_proration_date: Schema.optional(Schema.Number)
})
