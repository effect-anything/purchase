import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingToken = Schema.Struct({
  card: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.IssuingCard, any, any> =>
        Models.IssuingCard as Schema.Schema<Models.IssuingCard, any, any>
    )
  ),
  created: Schema.Number,
  device_fingerprint: Schema.NullOr(Schema.String),
  id: Schema.String,
  last4: Schema.optional(Schema.String),
  livemode: Schema.Boolean,
  network: Schema.Literal("mastercard", "visa"),
  network_data: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingNetworkTokenNetworkData, any, any> =>
        Models.IssuingNetworkTokenNetworkData as Schema.Schema<Models.IssuingNetworkTokenNetworkData, any, any>
    )
  ),
  network_updated_at: Schema.Number,
  object: Schema.Literal("issuing.token"),
  status: Schema.Literal("active", "deleted", "requested", "suspended"),
  wallet_provider: Schema.optional(Schema.Literal("apple_pay", "google_pay", "samsung_pay"))
})
export type IssuingToken = typeof IssuingToken.Type
