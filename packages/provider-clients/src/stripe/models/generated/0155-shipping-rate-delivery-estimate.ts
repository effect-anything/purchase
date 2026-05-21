import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ShippingRateDeliveryEstimate = Schema.Struct({
  maximum: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ShippingRateDeliveryEstimateBound, any, any> =>
        Models.ShippingRateDeliveryEstimateBound as Schema.Schema<Models.ShippingRateDeliveryEstimateBound, any, any>
    )
  ),
  minimum: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ShippingRateDeliveryEstimateBound, any, any> =>
        Models.ShippingRateDeliveryEstimateBound as Schema.Schema<Models.ShippingRateDeliveryEstimateBound, any, any>
    )
  )
})
export type ShippingRateDeliveryEstimate = typeof ShippingRateDeliveryEstimate.Type
