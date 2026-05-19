import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodCardChecks = Schema.Struct({
  address_line1_check: Schema.NullOr(Schema.String),
  address_postal_code_check: Schema.NullOr(Schema.String),
  cvc_check: Schema.NullOr(Schema.String),
})
export type PaymentMethodCardChecks = typeof PaymentMethodCardChecks.Type
