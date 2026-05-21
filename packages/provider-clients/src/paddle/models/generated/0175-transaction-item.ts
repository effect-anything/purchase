import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionItem = Schema.Struct({
  price: Schema.suspend(
    (): Schema.Schema<Models.Price, any, any> => Models.Price as Schema.Schema<Models.Price, any, any>
  ),
  quantity: Schema.Number,
  proration: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionItemProration, any, any> =>
        Models.TransactionItemProration as Schema.Schema<Models.TransactionItemProration, any, any>
    )
  )
})
export type TransactionItem = typeof TransactionItem.Type
