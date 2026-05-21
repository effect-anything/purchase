import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionPaymentMethodOptionsPix = Schema.Struct({
  expires_after_seconds: Schema.optional(Schema.Number),
  mandate_options: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionPaymentMethodOptionsMandateOptionsPix, any, any> =>
        Models.SubscriptionPaymentMethodOptionsMandateOptionsPix as Schema.Schema<
          Models.SubscriptionPaymentMethodOptionsMandateOptionsPix,
          any,
          any
        >
    )
  )
})
export type SubscriptionPaymentMethodOptionsPix = typeof SubscriptionPaymentMethodOptionsPix.Type
