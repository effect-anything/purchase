import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPreviewItemWithPriceIdRequest = Schema.Struct({
  quantity: Schema.Number,
  include_in_totals: Schema.optional(Schema.Boolean),
  proration: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.TransactionItemProration, any, any> =>
          Models.TransactionItemProration as Schema.Schema<Models.TransactionItemProration, any, any>
      )
    )
  ),
  price_id: Schema.suspend(
    (): Schema.Schema<Models.PriceId, any, any> => Models.PriceId as Schema.Schema<Models.PriceId, any, any>
  )
})
export type TransactionPreviewItemWithPriceIdRequest = typeof TransactionPreviewItemWithPriceIdRequest.Type
