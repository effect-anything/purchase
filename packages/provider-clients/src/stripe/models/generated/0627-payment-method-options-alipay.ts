import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodOptionsAlipay = Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session"))
})
export type PaymentMethodOptionsAlipay = typeof PaymentMethodOptionsAlipay.Type
