import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionListEntity = Schema.Struct({
  items: Schema.Array(Schema.suspend((): Schema.Schema<Models.TransactionEntity> => Models.TransactionEntity)),
  pagination: Schema.suspend((): Schema.Schema<Models.PaginationEntity> => Models.PaginationEntity)
})
export type TransactionListEntity = typeof TransactionListEntity.Type
