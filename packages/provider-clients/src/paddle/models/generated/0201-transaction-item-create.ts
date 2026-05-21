import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionItemCreate = Schema.Union(
  Schema.suspend((): Schema.Schema<Models.TransactionItemCreateWithPriceId> => Models.TransactionItemCreateWithPriceId),
  Schema.suspend((): Schema.Schema<Models.TransactionItemCreateWithPrice> => Models.TransactionItemCreateWithPrice),
  Schema.suspend(
    (): Schema.Schema<Models.TransactionItemCreateWithPriceAndProduct> =>
      Models.TransactionItemCreateWithPriceAndProduct
  )
)
export type TransactionItemCreate = typeof TransactionItemCreate.Type
