import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionItemEntity = Schema.Struct({
  id: Schema.String,
  mode: Schema.suspend(
    (): Schema.Schema<Models.EnvironmentMode, any, any> =>
      Models.EnvironmentMode as Schema.Schema<Models.EnvironmentMode, any, any>
  ),
  object: Schema.String,
  product_id: Schema.optional(Schema.String),
  price_id: Schema.optional(Schema.String),
  units: Schema.optional(Schema.NullOr(Schema.Number))
})
export type SubscriptionItemEntity = typeof SubscriptionItemEntity.Type
