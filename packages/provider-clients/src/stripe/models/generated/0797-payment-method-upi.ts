import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodUpi = Schema.Struct({
  vpa: Schema.NullOr(Schema.String),
})
export type PaymentMethodUpi = typeof PaymentMethodUpi.Type
