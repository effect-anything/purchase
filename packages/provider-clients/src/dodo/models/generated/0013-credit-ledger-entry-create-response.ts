import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CreditLedgerEntryCreateResponse = Schema.Struct({
  id: Schema.String,
  amount: Schema.String,
  balance_after: Schema.String,
  balance_before: Schema.String,
  created_at: Schema.String,
  credit_entitlement_id: Schema.String,
  customer_id: Schema.String,
  entry_type: Schema.suspend(() => Models.LedgerEntryType),
  is_credit: Schema.Boolean,
  overage_after: Schema.String,
  overage_before: Schema.String,
  grant_id: Schema.optional(Schema.NullOr(Schema.String)),
  reason: Schema.optional(Schema.NullOr(Schema.String)),
})
export type CreditLedgerEntryCreateResponse = typeof CreditLedgerEntryCreateResponse.Type
