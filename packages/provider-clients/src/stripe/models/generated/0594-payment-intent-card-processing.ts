import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentCardProcessing = Schema.Struct({
  customer_notification: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentProcessingCustomerNotification, any, any> =>
        Models.PaymentIntentProcessingCustomerNotification as Schema.Schema<
          Models.PaymentIntentProcessingCustomerNotification,
          any,
          any
        >
    )
  )
})
export type PaymentIntentCardProcessing = typeof PaymentIntentCardProcessing.Type
