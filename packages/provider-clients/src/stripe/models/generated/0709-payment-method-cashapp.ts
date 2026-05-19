import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodCashapp = Schema.Struct({
  buyer_id: Schema.NullOr(Schema.String),
  cashtag: Schema.NullOr(Schema.String),
})
export type PaymentMethodCashapp = typeof PaymentMethodCashapp.Type
