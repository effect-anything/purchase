import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodOptionsBillie = Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
})
export type PaymentMethodOptionsBillie = typeof PaymentMethodOptionsBillie.Type
