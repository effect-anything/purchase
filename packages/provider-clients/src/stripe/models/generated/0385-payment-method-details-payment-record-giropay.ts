import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsPaymentRecordGiropay = Schema.Struct({
  bank_code: Schema.NullOr(Schema.String),
  bank_name: Schema.NullOr(Schema.String),
  bic: Schema.NullOr(Schema.String),
  verified_name: Schema.NullOr(Schema.String),
})
export type PaymentMethodDetailsPaymentRecordGiropay = typeof PaymentMethodDetailsPaymentRecordGiropay.Type
