import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ShippingRateDeliveryEstimateBound = Schema.Struct({
  unit: Schema.Literal("business_day", "day", "hour", "month", "week"),
  value: Schema.Number,
})
export type ShippingRateDeliveryEstimateBound = typeof ShippingRateDeliveryEstimateBound.Type
