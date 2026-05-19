import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsNaverPay = Schema.Struct({
  buyer_id: Schema.NullOr(Schema.String),
  transaction_id: Schema.NullOr(Schema.String),
})
export type PaymentMethodDetailsNaverPay = typeof PaymentMethodDetailsNaverPay.Type
