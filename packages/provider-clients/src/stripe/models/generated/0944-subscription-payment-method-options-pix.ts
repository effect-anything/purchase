import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionPaymentMethodOptionsPix = Schema.Struct({
  expires_after_seconds: Schema.optional(Schema.Number),
  mandate_options: Schema.optional(Schema.suspend((): typeof Models.SubscriptionPaymentMethodOptionsMandateOptionsPix => Models.SubscriptionPaymentMethodOptionsMandateOptionsPix)),
})
export type SubscriptionPaymentMethodOptionsPix = typeof SubscriptionPaymentMethodOptionsPix.Type
