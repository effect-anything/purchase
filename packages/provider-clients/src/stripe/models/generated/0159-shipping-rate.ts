import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ShippingRate = Schema.Struct({
  active: Schema.Boolean,
  created: Schema.Number,
  delivery_estimate: Schema.NullOr(Schema.suspend((): typeof Models.ShippingRateDeliveryEstimate => Models.ShippingRateDeliveryEstimate)),
  display_name: Schema.NullOr(Schema.String),
  fixed_amount: Schema.optional(Schema.suspend((): typeof Models.ShippingRateFixedAmount => Models.ShippingRateFixedAmount)),
  id: Schema.String,
  livemode: Schema.Boolean,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  object: Schema.Literal("shipping_rate"),
  tax_behavior: Schema.NullOr(Schema.Literal("exclusive", "inclusive", "unspecified")),
  tax_code: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.TaxCode => Models.TaxCode))),
  type: Schema.Literal("fixed_amount"),
})
export type ShippingRate = typeof ShippingRate.Type
