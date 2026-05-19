import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerTaxLocation = Schema.Struct({
  country: Schema.String,
  source: Schema.Literal("billing_address", "ip_address", "payment_method", "shipping_destination"),
  state: Schema.NullOr(Schema.String),
})
export type CustomerTaxLocation = typeof CustomerTaxLocation.Type
