import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodOptionsPaynow = Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none")),
})
export type PaymentMethodOptionsPaynow = typeof PaymentMethodOptionsPaynow.Type
