import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const LedgerEntryType = Schema.Literal("credit", "debit")
export type LedgerEntryType = typeof LedgerEntryType.Type
