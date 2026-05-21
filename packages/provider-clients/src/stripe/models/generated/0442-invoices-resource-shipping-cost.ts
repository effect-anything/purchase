import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const InvoicesResourceShippingCost = Schema.Struct({
  amount_subtotal: Schema.Number,
  amount_tax: Schema.Number,
  amount_total: Schema.Number,
  shipping_rate: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.ShippingRate, any, any> =>
          Models.ShippingRate as Schema.Schema<Models.ShippingRate, any, any>
      )
    )
  ),
  taxes: Schema.optional(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.LineItemsTaxAmount, any, any> =>
          Models.LineItemsTaxAmount as Schema.Schema<Models.LineItemsTaxAmount, any, any>
      )
    )
  )
})
export type InvoicesResourceShippingCost = typeof InvoicesResourceShippingCost.Type
