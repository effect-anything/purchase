import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingToken = Schema.Struct({
  card: Schema.Union(Schema.String, Schema.suspend((): typeof Models.IssuingCard => Models.IssuingCard)),
  created: Schema.Number,
  device_fingerprint: Schema.NullOr(Schema.String),
  id: Schema.String,
  last4: Schema.optional(Schema.String),
  livemode: Schema.Boolean,
  network: Schema.Literal("mastercard", "visa"),
  network_data: Schema.optional(Schema.suspend((): typeof Models.IssuingNetworkTokenNetworkData => Models.IssuingNetworkTokenNetworkData)),
  network_updated_at: Schema.Number,
  object: Schema.Literal("issuing.token"),
  status: Schema.Literal("active", "deleted", "requested", "suspended"),
  wallet_provider: Schema.optional(Schema.Literal("apple_pay", "google_pay", "samsung_pay")),
})
export type IssuingToken = typeof IssuingToken.Type
