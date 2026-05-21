import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionItemCreateWithPriceId = Schema.Struct({
  quantity: Schema.Number,
  proration: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.TransactionItemProration, any, any> =>
          Models.TransactionItemProration as Schema.Schema<Models.TransactionItemProration, any, any>
      )
    )
  ),
  price_id: Schema.suspend(
    (): Schema.Schema<Models.PriceId, any, any> => Models.PriceId as Schema.Schema<Models.PriceId, any, any>
  )
})
export type TransactionItemCreateWithPriceId = typeof TransactionItemCreateWithPriceId.Type
