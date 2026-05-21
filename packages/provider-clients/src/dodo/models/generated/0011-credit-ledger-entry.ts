import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CreditLedgerEntry = Schema.Struct({
  id: Schema.String,
  amount: Schema.String,
  balance_after: Schema.String,
  balance_before: Schema.String,
  business_id: Schema.String,
  created_at: Schema.String,
  credit_entitlement_id: Schema.String,
  customer_id: Schema.String,
  is_credit: Schema.Boolean,
  overage_after: Schema.String,
  overage_before: Schema.String,
  transaction_type: Schema.suspend(
    (): Schema.Schema<Models.CreditLedgerTransactionType> => Models.CreditLedgerTransactionType
  ),
  description: Schema.optional(Schema.NullOr(Schema.String)),
  grant_id: Schema.optional(Schema.NullOr(Schema.String)),
  reference_id: Schema.optional(Schema.NullOr(Schema.String)),
  reference_type: Schema.optional(Schema.NullOr(Schema.String))
})
export type CreditLedgerEntry = typeof CreditLedgerEntry.Type
