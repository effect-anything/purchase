import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentIntentProcessingCustomerNotification = Schema.Struct({
  approval_requested: Schema.NullOr(Schema.Boolean),
  completes_at: Schema.NullOr(Schema.Number),
})
export type PaymentIntentProcessingCustomerNotification = typeof PaymentIntentProcessingCustomerNotification.Type
