import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionPhoneNumberCollection = Schema.Struct({
  enabled: Schema.Boolean,
})
export type PaymentPagesCheckoutSessionPhoneNumberCollection = typeof PaymentPagesCheckoutSessionPhoneNumberCollection.Type
