import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionPreviewItemWithPriceAndProductRequest = Schema.Struct({
  quantity: Schema.Number,
  include_in_totals: Schema.optional(Schema.Boolean),
  proration: Schema.optional(Schema.NullOr(Schema.suspend(() => Models.TransactionItemProration))),
  price: Schema.suspend(() => Models.TransactionPriceCreateWithProduct),
})
export type TransactionPreviewItemWithPriceAndProductRequest = typeof TransactionPreviewItemWithPriceAndProductRequest.Type
