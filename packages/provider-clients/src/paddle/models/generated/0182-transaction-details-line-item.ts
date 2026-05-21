import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionDetailsLineItem = Schema.Struct({
  price_id: Schema.suspend(
    (): Schema.Schema<Models.PriceId, any, any> => Models.PriceId as Schema.Schema<Models.PriceId, any, any>
  ),
  quantity: Schema.Number,
  proration: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionItemProration, any, any> =>
        Models.TransactionItemProration as Schema.Schema<Models.TransactionItemProration, any, any>
    )
  ),
  tax_rate: Schema.String,
  unit_totals: Schema.suspend(
    (): Schema.Schema<Models.Totals, any, any> => Models.Totals as Schema.Schema<Models.Totals, any, any>
  ),
  totals: Schema.suspend(
    (): Schema.Schema<Models.Totals, any, any> => Models.Totals as Schema.Schema<Models.Totals, any, any>
  ),
  product: Schema.suspend(
    (): Schema.Schema<Models.Product, any, any> => Models.Product as Schema.Schema<Models.Product, any, any>
  ),
  id: Schema.suspend(
    (): Schema.Schema<Models.TransactionItemId, any, any> =>
      Models.TransactionItemId as Schema.Schema<Models.TransactionItemId, any, any>
  )
})
export type TransactionDetailsLineItem = typeof TransactionDetailsLineItem.Type
