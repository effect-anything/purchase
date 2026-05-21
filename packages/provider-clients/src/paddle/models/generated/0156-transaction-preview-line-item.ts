import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPreviewLineItem = Schema.Struct({
  price_id: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.PriceId> => Models.PriceId)),
  quantity: Schema.Number,
  tax_rate: Schema.String,
  unit_totals: Schema.suspend((): Schema.Schema<Models.Totals> => Models.Totals),
  totals: Schema.suspend((): Schema.Schema<Models.Totals> => Models.Totals),
  product: Schema.suspend((): Schema.Schema<Models.ProductPreview> => Models.ProductPreview),
  proration: Schema.NullOr(
    Schema.suspend((): Schema.Schema<Models.TransactionItemProration> => Models.TransactionItemProration)
  )
})
export type TransactionPreviewLineItem = typeof TransactionPreviewLineItem.Type
