import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentLinksResourceShippingOption = Schema.Struct({
  shipping_amount: Schema.Number,
  shipping_rate: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.ShippingRate, any, any> =>
        Models.ShippingRate as Schema.Schema<Models.ShippingRate, any, any>
    )
  )
})
export type PaymentLinksResourceShippingOption = typeof PaymentLinksResourceShippingOption.Type
