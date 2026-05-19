import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsPaymentRecordUpi = Schema.Struct({
  vpa: Schema.NullOr(Schema.String),
})
export type PaymentMethodDetailsPaymentRecordUpi = typeof PaymentMethodDetailsPaymentRecordUpi.Type
