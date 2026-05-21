import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const UpsertSubscriptionItemEntity = Schema.Struct({
  id: Schema.optional(Schema.String),
  product_id: Schema.optional(Schema.String),
  price_id: Schema.optional(Schema.String),
  units: Schema.optional(Schema.Number)
})
export type UpsertSubscriptionItemEntity = typeof UpsertSubscriptionItemEntity.Type
