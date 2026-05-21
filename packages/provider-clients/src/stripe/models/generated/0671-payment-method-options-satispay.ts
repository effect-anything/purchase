import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodOptionsSatispay = Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual"))
})
export type PaymentMethodOptionsSatispay = typeof PaymentMethodOptionsSatispay.Type
