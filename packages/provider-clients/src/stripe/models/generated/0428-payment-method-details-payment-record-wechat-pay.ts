import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsPaymentRecordWechatPay = Schema.Struct({
  fingerprint: Schema.NullOr(Schema.String),
  location: Schema.optional(Schema.String),
  reader: Schema.optional(Schema.String),
  transaction_id: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsPaymentRecordWechatPay = typeof PaymentMethodDetailsPaymentRecordWechatPay.Type
