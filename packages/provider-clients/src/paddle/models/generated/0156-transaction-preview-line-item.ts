import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPreviewLineItem = Schema.Struct({
  price_id: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PriceId, any, any> => Models.PriceId as Schema.Schema<Models.PriceId, any, any>
    )
  ),
  quantity: Schema.Number,
  tax_rate: Schema.String,
  unit_totals: Schema.suspend(
    (): Schema.Schema<Models.Totals, any, any> => Models.Totals as Schema.Schema<Models.Totals, any, any>
  ),
  totals: Schema.suspend(
    (): Schema.Schema<Models.Totals, any, any> => Models.Totals as Schema.Schema<Models.Totals, any, any>
  ),
  product: Schema.suspend(
    (): Schema.Schema<Models.ProductPreview, any, any> =>
      Models.ProductPreview as Schema.Schema<Models.ProductPreview, any, any>
  ),
  proration: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionItemProration, any, any> =>
        Models.TransactionItemProration as Schema.Schema<Models.TransactionItemProration, any, any>
    )
  )
})
export type TransactionPreviewLineItem = typeof TransactionPreviewLineItem.Type
