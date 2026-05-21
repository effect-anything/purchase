import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ShippingRate = Schema.Struct({
  active: Schema.Boolean,
  created: Schema.Number,
  delivery_estimate: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ShippingRateDeliveryEstimate, any, any> =>
        Models.ShippingRateDeliveryEstimate as Schema.Schema<Models.ShippingRateDeliveryEstimate, any, any>
    )
  ),
  display_name: Schema.NullOr(Schema.String),
  fixed_amount: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.ShippingRateFixedAmount, any, any> =>
        Models.ShippingRateFixedAmount as Schema.Schema<Models.ShippingRateFixedAmount, any, any>
    )
  ),
  id: Schema.String,
  livemode: Schema.Boolean,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  object: Schema.Literal("shipping_rate"),
  tax_behavior: Schema.NullOr(Schema.Literal("exclusive", "inclusive", "unspecified")),
  tax_code: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.TaxCode, any, any> => Models.TaxCode as Schema.Schema<Models.TaxCode, any, any>
      )
    )
  ),
  type: Schema.Literal("fixed_amount")
})
export type ShippingRate = typeof ShippingRate.Type
