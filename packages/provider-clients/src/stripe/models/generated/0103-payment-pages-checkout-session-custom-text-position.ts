import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionCustomTextPosition = Schema.Struct({
  message: Schema.String
})
export type PaymentPagesCheckoutSessionCustomTextPosition = typeof PaymentPagesCheckoutSessionCustomTextPosition.Type
