import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionListEntity = Schema.Struct({
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.TransactionEntity, any, any> =>
        Models.TransactionEntity as Schema.Schema<Models.TransactionEntity, any, any>
    )
  ),
  pagination: Schema.suspend(
    (): Schema.Schema<Models.PaginationEntity, any, any> =>
      Models.PaginationEntity as Schema.Schema<Models.PaginationEntity, any, any>
  )
})
export type TransactionListEntity = typeof TransactionListEntity.Type
