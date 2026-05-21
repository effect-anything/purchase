import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionStatus = Schema.Literal(
  "pending",
  "paid",
  "refunded",
  "partialRefund",
  "chargedBack",
  "uncollectible",
  "declined",
  "void",
  "canceled"
)
export type TransactionStatus = typeof TransactionStatus.Type
