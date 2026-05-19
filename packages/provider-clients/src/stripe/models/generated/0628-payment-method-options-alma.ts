import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodOptionsAlma = Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual")),
})
export type PaymentMethodOptionsAlma = typeof PaymentMethodOptionsAlma.Type
