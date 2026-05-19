import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsPaymentRecordMultibanco = Schema.Struct({
  entity: Schema.NullOr(Schema.String),
  reference: Schema.NullOr(Schema.String),
})
export type PaymentMethodDetailsPaymentRecordMultibanco = typeof PaymentMethodDetailsPaymentRecordMultibanco.Type
