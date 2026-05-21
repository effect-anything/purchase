import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionItem = Schema.Struct({
  price: Schema.suspend((): Schema.Schema<Models.Price> => Models.Price),
  quantity: Schema.Number,
  proration: Schema.NullOr(
    Schema.suspend((): Schema.Schema<Models.TransactionItemProration> => Models.TransactionItemProration)
  )
})
export type TransactionItem = typeof TransactionItem.Type
