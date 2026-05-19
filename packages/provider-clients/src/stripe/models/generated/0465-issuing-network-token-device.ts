import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingNetworkTokenDevice = Schema.Struct({
  device_fingerprint: Schema.optional(Schema.String),
  ip_address: Schema.optional(Schema.String),
  location: Schema.optional(Schema.String),
  name: Schema.optional(Schema.String),
  phone_number: Schema.optional(Schema.String),
  type: Schema.optional(Schema.Literal("other", "phone", "watch")),
})
export type IssuingNetworkTokenDevice = typeof IssuingNetworkTokenDevice.Type
