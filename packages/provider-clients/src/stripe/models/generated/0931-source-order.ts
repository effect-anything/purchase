import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SourceOrder = Schema.Struct({
  amount: Schema.Number,
  currency: Schema.String,
  email: Schema.optional(Schema.String),
  items: Schema.NullOr(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.SourceOrderItem, any, any> =>
          Models.SourceOrderItem as Schema.Schema<Models.SourceOrderItem, any, any>
      )
    )
  ),
  shipping: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.Shipping, any, any> => Models.Shipping as Schema.Schema<Models.Shipping, any, any>
    )
  )
})
export type SourceOrder = typeof SourceOrder.Type
