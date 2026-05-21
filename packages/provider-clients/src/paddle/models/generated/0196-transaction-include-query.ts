import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionIncludeQuery = Schema.Literal(
  "address",
  "adjustments",
  "adjustments_totals",
  "available_payment_methods",
  "business",
  "customer",
  "discount"
)
export type TransactionIncludeQuery = typeof TransactionIncludeQuery.Type
