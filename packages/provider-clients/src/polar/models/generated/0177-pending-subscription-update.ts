import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PendingSubscriptionUpdate = Schema.Struct({
  created_at: Schema.String,
  modified_at: Schema.NullOr(Schema.String),
  id: Schema.String,
  applies_at: Schema.String,
  product_id: Schema.NullOr(Schema.String),
  seats: Schema.NullOr(Schema.Number)
})
export type PendingSubscriptionUpdate = typeof PendingSubscriptionUpdate.Type
