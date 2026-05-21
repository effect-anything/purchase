import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionPreviewCreateItems = Schema.Union(
  Schema.suspend(
    (): Schema.Schema<Models.TransactionPreviewItemWithPriceIdRequest, any, any> =>
      Models.TransactionPreviewItemWithPriceIdRequest as Schema.Schema<
        Models.TransactionPreviewItemWithPriceIdRequest,
        any,
        any
      >
  ),
  Schema.suspend(
    (): Schema.Schema<Models.TransactionPreviewItemWithPriceRequest, any, any> =>
      Models.TransactionPreviewItemWithPriceRequest as Schema.Schema<
        Models.TransactionPreviewItemWithPriceRequest,
        any,
        any
      >
  ),
  Schema.suspend(
    (): Schema.Schema<Models.TransactionPreviewItemWithPriceAndProductRequest, any, any> =>
      Models.TransactionPreviewItemWithPriceAndProductRequest as Schema.Schema<
        Models.TransactionPreviewItemWithPriceAndProductRequest,
        any,
        any
      >
  )
)
export type TransactionPreviewCreateItems = typeof TransactionPreviewCreateItems.Type
