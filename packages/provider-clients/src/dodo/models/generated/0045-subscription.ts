import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Subscription = Schema.Struct({
  subscription_id: Schema.String,
  status: Schema.String,
  customer: Schema.optional(Schema.suspend(() => Models.Customer)),
  product: Schema.optional(Schema.suspend(() => Models.Product)),
  created_at: Schema.optional(Schema.String),
  updated_at: Schema.optional(Schema.String),
})
export type Subscription = typeof Subscription.Type
