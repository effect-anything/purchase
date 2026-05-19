import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsPaymentRecordPix = Schema.Struct({
  bank_transaction_id: Schema.optional(Schema.NullOr(Schema.String)),
  mandate: Schema.optional(Schema.String),
})
export type PaymentMethodDetailsPaymentRecordPix = typeof PaymentMethodDetailsPaymentRecordPix.Type
