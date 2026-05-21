import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsPaymentRecordAmazonPay = Schema.Struct({
  funding: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodAmazonPayDetailsResourceFunding,
        any,
        any
      > =>
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodAmazonPayDetailsResourceFunding as Schema.Schema<
          Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodAmazonPayDetailsResourceFunding,
          any,
          any
        >
    )
  ),
  transaction_id: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsPaymentRecordAmazonPay = typeof PaymentMethodDetailsPaymentRecordAmazonPay.Type
