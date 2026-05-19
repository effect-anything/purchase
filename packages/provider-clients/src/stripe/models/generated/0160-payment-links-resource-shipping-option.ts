import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentLinksResourceShippingOption = Schema.Struct({
  shipping_amount: Schema.Number,
  shipping_rate: Schema.Union(Schema.String, Schema.suspend((): typeof Models.ShippingRate => Models.ShippingRate)),
})
export type PaymentLinksResourceShippingOption = typeof PaymentLinksResourceShippingOption.Type
