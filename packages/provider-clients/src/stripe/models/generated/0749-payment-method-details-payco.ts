import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsPayco = Schema.Struct({
  buyer_id: Schema.NullOr(Schema.String),
  transaction_id: Schema.NullOr(Schema.String),
})
export type PaymentMethodDetailsPayco = typeof PaymentMethodDetailsPayco.Type
