import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPreviewItem = Schema.Struct({
  quantity: Schema.Number,
  include_in_totals: Schema.Boolean,
  proration: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionItemProration, any, any> =>
        Models.TransactionItemProration as Schema.Schema<Models.TransactionItemProration, any, any>
    )
  ),
  price: Schema.suspend(
    (): Schema.Schema<Models.PricePreview, any, any> =>
      Models.PricePreview as Schema.Schema<Models.PricePreview, any, any>
  )
})
export type TransactionPreviewItem = typeof TransactionPreviewItem.Type
