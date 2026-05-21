import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutPaycoPaymentMethodOptions = Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual"))
})
export type CheckoutPaycoPaymentMethodOptions = typeof CheckoutPaycoPaymentMethodOptions.Type
