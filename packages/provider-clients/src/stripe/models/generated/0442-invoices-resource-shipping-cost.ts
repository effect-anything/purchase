import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const InvoicesResourceShippingCost = Schema.Struct({
  amount_subtotal: Schema.Number,
  amount_tax: Schema.Number,
  amount_total: Schema.Number,
  shipping_rate: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.ShippingRate => Models.ShippingRate))),
  taxes: Schema.optional(Schema.Array(Schema.suspend((): typeof Models.LineItemsTaxAmount => Models.LineItemsTaxAmount))),
})
export type InvoicesResourceShippingCost = typeof InvoicesResourceShippingCost.Type
