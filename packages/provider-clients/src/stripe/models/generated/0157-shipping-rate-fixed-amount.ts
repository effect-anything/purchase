import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ShippingRateFixedAmount = Schema.Struct({
  amount: Schema.Number,
  currency: Schema.String,
  currency_options: Schema.optional(
    Schema.Record({
      key: Schema.String,
      value: Schema.suspend(
        (): Schema.Schema<Models.ShippingRateCurrencyOption, any, any> =>
          Models.ShippingRateCurrencyOption as Schema.Schema<Models.ShippingRateCurrencyOption, any, any>
      )
    })
  )
})
export type ShippingRateFixedAmount = typeof ShippingRateFixedAmount.Type
