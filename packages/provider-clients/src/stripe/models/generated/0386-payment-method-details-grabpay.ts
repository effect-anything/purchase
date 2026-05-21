import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsGrabpay = Schema.Struct({
  transaction_id: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsGrabpay = typeof PaymentMethodDetailsGrabpay.Type
