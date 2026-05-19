import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionType = Schema.Literal("payment", "invoice")
export type TransactionType = typeof TransactionType.Type
