import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceWallet = Schema.Struct({
  apple_pay: Schema.optional(Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceWalletResourceApplePay => Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceWalletResourceApplePay)),
  dynamic_last4: Schema.optional(Schema.String),
  google_pay: Schema.optional(Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceWalletResourceGooglePay => Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceWalletResourceGooglePay)),
  type: Schema.String,
})
export type PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceWallet = typeof PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceWallet.Type
