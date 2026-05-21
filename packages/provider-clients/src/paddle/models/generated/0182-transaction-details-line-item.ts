import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionDetailsLineItem = Schema.Struct({
  price_id: Schema.suspend((): Schema.Schema<Models.PriceId> => Models.PriceId),
  quantity: Schema.Number,
  proration: Schema.NullOr(
    Schema.suspend((): Schema.Schema<Models.TransactionItemProration> => Models.TransactionItemProration)
  ),
  tax_rate: Schema.String,
  unit_totals: Schema.suspend((): Schema.Schema<Models.Totals> => Models.Totals),
  totals: Schema.suspend((): Schema.Schema<Models.Totals> => Models.Totals),
  product: Schema.suspend((): Schema.Schema<Models.Product> => Models.Product),
  id: Schema.suspend((): Schema.Schema<Models.TransactionItemId> => Models.TransactionItemId)
})
export type TransactionDetailsLineItem = typeof TransactionDetailsLineItem.Type
