import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionOriginQuery = Schema.Literal(
  "api",
  "subscription_charge",
  "subscription_payment_method_change",
  "subscription_recurring",
  "subscription_update",
  "subscription_import",
  "web"
)
export type TransactionOriginQuery = typeof TransactionOriginQuery.Type
