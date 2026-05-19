import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodPaypal = Schema.Struct({
  country: Schema.NullOr(Schema.String),
  payer_email: Schema.NullOr(Schema.String),
  payer_id: Schema.NullOr(Schema.String),
})
export type PaymentMethodPaypal = typeof PaymentMethodPaypal.Type
