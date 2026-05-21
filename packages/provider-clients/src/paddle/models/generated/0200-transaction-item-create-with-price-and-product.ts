import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionItemCreateWithPriceAndProduct = Schema.Struct({
  quantity: Schema.Number,
  proration: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.TransactionItemProration, any, any> =>
          Models.TransactionItemProration as Schema.Schema<Models.TransactionItemProration, any, any>
      )
    )
  ),
  price: Schema.suspend(
    (): Schema.Schema<Models.TransactionPriceCreateWithProduct, any, any> =>
      Models.TransactionPriceCreateWithProduct as Schema.Schema<Models.TransactionPriceCreateWithProduct, any, any>
  )
})
export type TransactionItemCreateWithPriceAndProduct = typeof TransactionItemCreateWithPriceAndProduct.Type
