import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CreditLedgerEntryListResponse = Schema.Struct({
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.CreditLedgerEntry, any, any> =>
        Models.CreditLedgerEntry as Schema.Schema<Models.CreditLedgerEntry, any, any>
    )
  ),
  total: Schema.optional(Schema.Number)
})
export type CreditLedgerEntryListResponse = typeof CreditLedgerEntryListResponse.Type
