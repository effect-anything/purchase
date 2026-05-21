import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionCreateCustomer = Schema.Struct({
  metadata: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean)
    })
  ),
  product_id: Schema.String,
  customer_id: Schema.String
})
export type SubscriptionCreateCustomer = typeof SubscriptionCreateCustomer.Type
