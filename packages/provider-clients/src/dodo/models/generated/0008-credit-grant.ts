import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CreditGrant = Schema.Struct({
  id: Schema.String,
  created_at: Schema.String,
  credit_entitlement_id: Schema.String,
  customer_id: Schema.String,
  initial_amount: Schema.String,
  is_expired: Schema.Boolean,
  is_rolled_over: Schema.Boolean,
  remaining_amount: Schema.String,
  rollover_count: Schema.Number,
  source_type: Schema.Literal("subscription", "one_time", "addon", "api", "rollover"),
  updated_at: Schema.String,
  expires_at: Schema.optional(Schema.NullOr(Schema.String)),
  metadata: Schema.optional(Schema.suspend((): Schema.Schema<Models.Metadata> => Models.Metadata)),
  parent_grant_id: Schema.optional(Schema.NullOr(Schema.String)),
  source_id: Schema.optional(Schema.NullOr(Schema.String))
})
export type CreditGrant = typeof CreditGrant.Type
