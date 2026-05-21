import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutPaymentMethodOptionsMandateOptionsSepaDebit = Schema.Struct({
  reference_prefix: Schema.optional(Schema.String)
})
export type CheckoutPaymentMethodOptionsMandateOptionsSepaDebit =
  typeof CheckoutPaymentMethodOptionsMandateOptionsSepaDebit.Type
