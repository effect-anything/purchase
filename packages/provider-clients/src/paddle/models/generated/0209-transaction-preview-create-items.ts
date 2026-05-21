import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPreviewCreateItems = Schema.Union(
  Schema.suspend(
    (): Schema.Schema<Models.TransactionPreviewItemWithPriceIdRequest> =>
      Models.TransactionPreviewItemWithPriceIdRequest
  ),
  Schema.suspend(
    (): Schema.Schema<Models.TransactionPreviewItemWithPriceRequest> => Models.TransactionPreviewItemWithPriceRequest
  ),
  Schema.suspend(
    (): Schema.Schema<Models.TransactionPreviewItemWithPriceAndProductRequest> =>
      Models.TransactionPreviewItemWithPriceAndProductRequest
  )
)
export type TransactionPreviewCreateItems = typeof TransactionPreviewCreateItems.Type
