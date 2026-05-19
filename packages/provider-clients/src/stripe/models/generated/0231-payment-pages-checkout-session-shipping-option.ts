import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionShippingOption = Schema.Struct({
  shipping_amount: Schema.Number,
  shipping_rate: Schema.Union(Schema.String, Schema.suspend((): typeof Models.ShippingRate => Models.ShippingRate)),
})
export type PaymentPagesCheckoutSessionShippingOption = typeof PaymentPagesCheckoutSessionShippingOption.Type
