import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsOxxo = Schema.Struct({
  number: Schema.NullOr(Schema.String),
})
export type PaymentMethodDetailsOxxo = typeof PaymentMethodDetailsOxxo.Type
