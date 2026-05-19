import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionItemCreateWithPriceId = Schema.Struct({
  quantity: Schema.Number,
  proration: Schema.optional(Schema.NullOr(Schema.suspend(() => Models.TransactionItemProration))),
  price_id: Schema.suspend(() => Models.PriceId),
})
export type TransactionItemCreateWithPriceId = typeof TransactionItemCreateWithPriceId.Type
