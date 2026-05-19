import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionItemCreateWithPrice = Schema.Struct({
  quantity: Schema.Number,
  proration: Schema.optional(Schema.NullOr(Schema.suspend(() => Models.TransactionItemProration))),
  price: Schema.suspend(() => Models.TransactionPriceCreateWithProductId),
})
export type TransactionItemCreateWithPrice = typeof TransactionItemCreateWithPrice.Type
