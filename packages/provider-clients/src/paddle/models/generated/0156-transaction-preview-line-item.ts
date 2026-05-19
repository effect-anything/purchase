import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionPreviewLineItem = Schema.Struct({
  price_id: Schema.NullOr(Schema.suspend(() => Models.PriceId)),
  quantity: Schema.Number,
  tax_rate: Schema.String,
  unit_totals: Schema.suspend(() => Models.Totals),
  totals: Schema.suspend(() => Models.Totals),
  product: Schema.suspend(() => Models.ProductPreview),
  proration: Schema.NullOr(Schema.suspend(() => Models.TransactionItemProration)),
})
export type TransactionPreviewLineItem = typeof TransactionPreviewLineItem.Type
