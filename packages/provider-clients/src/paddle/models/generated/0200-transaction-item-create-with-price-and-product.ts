import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionItemCreateWithPriceAndProduct = Schema.Struct({
  quantity: Schema.Number,
  proration: Schema.optional(
    Schema.NullOr(Schema.suspend((): Schema.Schema<Models.TransactionItemProration> => Models.TransactionItemProration))
  ),
  price: Schema.suspend(
    (): Schema.Schema<Models.TransactionPriceCreateWithProduct> => Models.TransactionPriceCreateWithProduct
  )
})
export type TransactionItemCreateWithPriceAndProduct = typeof TransactionItemCreateWithPriceAndProduct.Type
