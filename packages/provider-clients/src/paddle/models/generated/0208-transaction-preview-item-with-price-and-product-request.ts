import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPreviewItemWithPriceAndProductRequest = Schema.Struct({
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
  price: Schema.suspend(
    (): Schema.Schema<Models.TransactionPriceCreateWithProduct, any, any> =>
      Models.TransactionPriceCreateWithProduct as Schema.Schema<Models.TransactionPriceCreateWithProduct, any, any>
  )
})
export type TransactionPreviewItemWithPriceAndProductRequest =
  typeof TransactionPreviewItemWithPriceAndProductRequest.Type
