import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionItem = Schema.Struct({
  price: Schema.suspend(() => Models.Price),
  quantity: Schema.Number,
  proration: Schema.NullOr(Schema.suspend(() => Models.TransactionItemProration)),
})
export type TransactionItem = typeof TransactionItem.Type
