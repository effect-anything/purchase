import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutLinkCreateProducts = Schema.Struct({
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Union(Schema.String, Schema.Number, Schema.Number, Schema.Boolean) })),
  trial_interval: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.TrialInterval => Models.TrialInterval))),
  trial_interval_count: Schema.optional(Schema.NullOr(Schema.Number)),
  payment_processor: Schema.String,
  label: Schema.optional(Schema.NullOr(Schema.String)),
  allow_discount_codes: Schema.optional(Schema.Boolean),
  require_billing_address: Schema.optional(Schema.Boolean),
  discount_id: Schema.optional(Schema.NullOr(Schema.String)),
  success_url: Schema.optional(Schema.NullOr(Schema.String)),
  return_url: Schema.optional(Schema.NullOr(Schema.String)),
  products: Schema.Array(Schema.String),
})
export type CheckoutLinkCreateProducts = typeof CheckoutLinkCreateProducts.Type
