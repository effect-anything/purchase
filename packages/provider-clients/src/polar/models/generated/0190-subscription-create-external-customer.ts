import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionCreateExternalCustomer = Schema.Struct({
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean) })),
  product_id: Schema.String,
  external_customer_id: Schema.String,
})
export type SubscriptionCreateExternalCustomer = typeof SubscriptionCreateExternalCustomer.Type
