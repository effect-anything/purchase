import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsPaymentRecordAlma = Schema.Struct({
  installments: Schema.optional(Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodAlmaDetailsResourceInstallments => Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodAlmaDetailsResourceInstallments)),
  transaction_id: Schema.NullOr(Schema.String),
})
export type PaymentMethodDetailsPaymentRecordAlma = typeof PaymentMethodDetailsPaymentRecordAlma.Type
