import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPreviewItemWithPriceRequest = Schema.Struct({
  quantity: Schema.Number,
  include_in_totals: Schema.optional(Schema.Boolean),
  proration: Schema.optional(
    Schema.NullOr(Schema.suspend((): Schema.Schema<Models.TransactionItemProration> => Models.TransactionItemProration))
  ),
  price: Schema.suspend(
    (): Schema.Schema<Models.TransactionPriceCreateWithProductId> => Models.TransactionPriceCreateWithProductId
  )
})
export type TransactionPreviewItemWithPriceRequest = typeof TransactionPreviewItemWithPriceRequest.Type
