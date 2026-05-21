import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionStatus = Schema.Literal("draft", "ready", "billed", "paid", "completed", "canceled", "past_due")
export type TransactionStatus = typeof TransactionStatus.Type
