import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ShippingRateDeliveryEstimate = Schema.Struct({
  maximum: Schema.NullOr(Schema.suspend((): typeof Models.ShippingRateDeliveryEstimateBound => Models.ShippingRateDeliveryEstimateBound)),
  minimum: Schema.NullOr(Schema.suspend((): typeof Models.ShippingRateDeliveryEstimateBound => Models.ShippingRateDeliveryEstimateBound)),
})
export type ShippingRateDeliveryEstimate = typeof ShippingRateDeliveryEstimate.Type
