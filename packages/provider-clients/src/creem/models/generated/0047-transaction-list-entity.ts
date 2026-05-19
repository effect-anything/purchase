import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionListEntity = Schema.Struct({
  items: Schema.Array(Schema.suspend(() => Models.TransactionEntity)),
  pagination: Schema.suspend(() => Models.PaginationEntity),
})
export type TransactionListEntity = typeof TransactionListEntity.Type
