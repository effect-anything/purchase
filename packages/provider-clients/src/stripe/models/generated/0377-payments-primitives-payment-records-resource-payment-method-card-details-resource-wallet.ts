import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceWallet = Schema.Struct({
  apple_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceWalletResourceApplePay,
        any,
        any
      > =>
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceWalletResourceApplePay as Schema.Schema<
          Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceWalletResourceApplePay,
          any,
          any
        >
    )
  ),
  dynamic_last4: Schema.optional(Schema.String),
  google_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceWalletResourceGooglePay,
        any,
        any
      > =>
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceWalletResourceGooglePay as Schema.Schema<
          Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceWalletResourceGooglePay,
          any,
          any
        >
    )
  ),
  type: Schema.String
})
export type PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceWallet =
  typeof PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceWallet.Type
