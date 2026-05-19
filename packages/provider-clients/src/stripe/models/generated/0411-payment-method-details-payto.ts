import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsPayto = Schema.Struct({
  bsb_number: Schema.NullOr(Schema.String),
  last4: Schema.NullOr(Schema.String),
  mandate: Schema.optional(Schema.String),
  pay_id: Schema.NullOr(Schema.String),
})
export type PaymentMethodDetailsPayto = typeof PaymentMethodDetailsPayto.Type
