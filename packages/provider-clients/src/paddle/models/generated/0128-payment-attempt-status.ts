import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentAttemptStatus = Schema.Literal(
  "authorized",
  "authorized_flagged",
  "canceled",
  "captured",
  "error",
  "action_required",
  "pending_no_action_required",
  "created",
  "unknown",
  "dropped"
)
export type PaymentAttemptStatus = typeof PaymentAttemptStatus.Type
