import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPreviewItemWithPriceIdRequest = Schema.Struct({
  quantity: Schema.Number,
  include_in_totals: Schema.optional(Schema.Boolean),
  proration: Schema.optional(
    Schema.NullOr(Schema.suspend((): Schema.Schema<Models.TransactionItemProration> => Models.TransactionItemProration))
  ),
  price_id: Schema.suspend((): Schema.Schema<Models.PriceId> => Models.PriceId)
})
export type TransactionPreviewItemWithPriceIdRequest = typeof TransactionPreviewItemWithPriceIdRequest.Type
