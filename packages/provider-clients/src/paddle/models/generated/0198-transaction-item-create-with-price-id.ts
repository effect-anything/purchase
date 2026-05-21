import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionItemCreateWithPriceId = Schema.Struct({
  quantity: Schema.Number,
  proration: Schema.optional(
    Schema.NullOr(Schema.suspend((): Schema.Schema<Models.TransactionItemProration> => Models.TransactionItemProration))
  ),
  price_id: Schema.suspend((): Schema.Schema<Models.PriceId> => Models.PriceId)
})
export type TransactionItemCreateWithPriceId = typeof TransactionItemCreateWithPriceId.Type
