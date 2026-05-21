import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionItemCreate = Schema.Union(
  Schema.suspend(
    (): Schema.Schema<Models.TransactionItemCreateWithPriceId, any, any> =>
      Models.TransactionItemCreateWithPriceId as Schema.Schema<Models.TransactionItemCreateWithPriceId, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.TransactionItemCreateWithPrice, any, any> =>
      Models.TransactionItemCreateWithPrice as Schema.Schema<Models.TransactionItemCreateWithPrice, any, any>
  ),
  Schema.suspend(
    (): Schema.Schema<Models.TransactionItemCreateWithPriceAndProduct, any, any> =>
      Models.TransactionItemCreateWithPriceAndProduct as Schema.Schema<
        Models.TransactionItemCreateWithPriceAndProduct,
        any,
        any
      >
  )
)
export type TransactionItemCreate = typeof TransactionItemCreate.Type
