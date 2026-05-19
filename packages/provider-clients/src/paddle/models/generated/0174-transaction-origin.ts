import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionOrigin = Schema.suspend(() => Models.PublicTransactionOrigin)
export type TransactionOrigin = typeof TransactionOrigin.Type
