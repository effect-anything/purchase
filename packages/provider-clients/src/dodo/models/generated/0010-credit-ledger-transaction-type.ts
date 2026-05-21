import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CreditLedgerTransactionType = Schema.Literal(
  "credit_added",
  "credit_deducted",
  "credit_expired",
  "credit_rolled_over",
  "rollover_forfeited",
  "overage_charged",
  "overage_reset",
  "auto_top_up",
  "manual_adjustment",
  "refund"
)
export type CreditLedgerTransactionType = typeof CreditLedgerTransactionType.Type
