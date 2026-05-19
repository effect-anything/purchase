import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const LicenseKey = Schema.Struct({
  id: Schema.String,
  business_id: Schema.String,
  created_at: Schema.String,
  customer_id: Schema.String,
  instances_count: Schema.Number,
  key: Schema.String,
  product_id: Schema.String,
  source: Schema.Literal("auto", "import"),
  status: Schema.suspend(() => Models.LicenseKeyStatus),
  activations_limit: Schema.optional(Schema.NullOr(Schema.Number)),
  expires_at: Schema.optional(Schema.NullOr(Schema.String)),
  payment_id: Schema.optional(Schema.NullOr(Schema.String)),
  subscription_id: Schema.optional(Schema.NullOr(Schema.String)),
})
export type LicenseKey = typeof LicenseKey.Type
