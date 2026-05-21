import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodOptionsPromptpay = Schema.Struct({
  setup_future_usage: Schema.optional(Schema.Literal("none"))
})
export type PaymentMethodOptionsPromptpay = typeof PaymentMethodOptionsPromptpay.Type
