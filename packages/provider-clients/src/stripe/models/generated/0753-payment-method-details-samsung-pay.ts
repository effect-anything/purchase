import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsSamsungPay = Schema.Struct({
  buyer_id: Schema.NullOr(Schema.String),
  transaction_id: Schema.NullOr(Schema.String),
})
export type PaymentMethodDetailsSamsungPay = typeof PaymentMethodDetailsSamsungPay.Type
