import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionDetailsLineItem = Schema.Struct({
  price_id: Schema.suspend(() => Models.PriceId),
  quantity: Schema.Number,
  proration: Schema.NullOr(Schema.suspend(() => Models.TransactionItemProration)),
  tax_rate: Schema.String,
  unit_totals: Schema.suspend(() => Models.Totals),
  totals: Schema.suspend(() => Models.Totals),
  product: Schema.suspend(() => Models.Product),
  id: Schema.suspend(() => Models.TransactionItemId),
})
export type TransactionDetailsLineItem = typeof TransactionDetailsLineItem.Type
