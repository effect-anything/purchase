import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionItemCreateWithPrice = Schema.Struct({
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
    (): Schema.Schema<Models.TransactionPriceCreateWithProductId, any, any> =>
      Models.TransactionPriceCreateWithProductId as Schema.Schema<Models.TransactionPriceCreateWithProductId, any, any>
  )
})
export type TransactionItemCreateWithPrice = typeof TransactionItemCreateWithPrice.Type
