import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentIntentCardProcessing = Schema.Struct({
  customer_notification: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentProcessingCustomerNotification => Models.PaymentIntentProcessingCustomerNotification)),
})
export type PaymentIntentCardProcessing = typeof PaymentIntentCardProcessing.Type
