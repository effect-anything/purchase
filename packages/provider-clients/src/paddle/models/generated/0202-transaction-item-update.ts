import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionItemUpdate = Schema.Union(Schema.suspend(() => Models.TransactionItemCreateWithPriceId), Schema.suspend(() => Models.TransactionItemCreateWithPrice), Schema.suspend(() => Models.TransactionItemCreateWithPriceAndProduct))
export type TransactionItemUpdate = typeof TransactionItemUpdate.Type
