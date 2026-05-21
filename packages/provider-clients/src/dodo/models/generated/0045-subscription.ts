import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Subscription = Schema.Struct({
  subscription_id: Schema.String,
  status: Schema.String,
  customer: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.Customer, any, any> => Models.Customer as Schema.Schema<Models.Customer, any, any>
    )
  ),
  product: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.Product, any, any> => Models.Product as Schema.Schema<Models.Product, any, any>
    )
  ),
  created_at: Schema.optional(Schema.String),
  updated_at: Schema.optional(Schema.String)
})
export type Subscription = typeof Subscription.Type
