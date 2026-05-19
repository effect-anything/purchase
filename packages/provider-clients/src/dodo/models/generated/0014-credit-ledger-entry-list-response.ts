import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CreditLedgerEntryListResponse = Schema.Struct({
  items: Schema.Array(Schema.suspend(() => Models.CreditLedgerEntry)),
  total: Schema.optional(Schema.Number),
})
export type CreditLedgerEntryListResponse = typeof CreditLedgerEntryListResponse.Type
