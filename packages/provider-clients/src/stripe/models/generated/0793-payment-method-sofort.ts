import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodSofort = Schema.Struct({
  country: Schema.NullOr(Schema.String),
})
export type PaymentMethodSofort = typeof PaymentMethodSofort.Type
