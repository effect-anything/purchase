import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodPayto = Schema.Struct({
  bsb_number: Schema.NullOr(Schema.String),
  last4: Schema.NullOr(Schema.String),
  pay_id: Schema.NullOr(Schema.String)
})
export type PaymentMethodPayto = typeof PaymentMethodPayto.Type
