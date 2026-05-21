import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentNextActionCardAwaitNotification = Schema.Struct({
  charge_attempt_at: Schema.NullOr(Schema.Number),
  customer_approval_required: Schema.NullOr(Schema.Boolean)
})
export type PaymentIntentNextActionCardAwaitNotification = typeof PaymentIntentNextActionCardAwaitNotification.Type
