import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionUpdateAttributes = Schema.Struct({
  variant_id: Schema.optional(Schema.Number),
  cancelled: Schema.optional(Schema.Boolean),
  billing_anchor: Schema.optional(Schema.Number),
  invoice_immediately: Schema.optional(Schema.Boolean),
  disable_prorations: Schema.optional(Schema.Boolean),
  pause: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  trial_ends_at: Schema.optional(Schema.NullOr(Schema.String))
})
export type SubscriptionUpdateAttributes = typeof SubscriptionUpdateAttributes.Type
