import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingCardShipping = Schema.Struct({
  address: Schema.suspend((): typeof Models.Address => Models.Address),
  address_validation: Schema.NullOr(Schema.suspend((): typeof Models.IssuingCardShippingAddressValidation => Models.IssuingCardShippingAddressValidation)),
  carrier: Schema.NullOr(Schema.Literal("dhl", "fedex", "royal_mail", "usps")),
  customs: Schema.NullOr(Schema.suspend((): typeof Models.IssuingCardShippingCustoms => Models.IssuingCardShippingCustoms)),
  eta: Schema.NullOr(Schema.Number),
  name: Schema.String,
  phone_number: Schema.NullOr(Schema.String),
  require_signature: Schema.NullOr(Schema.Boolean),
  service: Schema.Literal("express", "priority", "standard"),
  status: Schema.NullOr(Schema.Literal("canceled", "delivered", "failure", "pending", "returned", "shipped", "submitted")),
  tracking_number: Schema.NullOr(Schema.String),
  tracking_url: Schema.NullOr(Schema.String),
  type: Schema.Literal("bulk", "individual"),
})
export type IssuingCardShipping = typeof IssuingCardShipping.Type
