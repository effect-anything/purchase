import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionPreviewItem = Schema.Struct({
  quantity: Schema.Number,
  include_in_totals: Schema.Boolean,
  proration: Schema.NullOr(Schema.suspend(() => Models.TransactionItemProration)),
  price: Schema.suspend(() => Models.PricePreview),
})
export type TransactionPreviewItem = typeof TransactionPreviewItem.Type
