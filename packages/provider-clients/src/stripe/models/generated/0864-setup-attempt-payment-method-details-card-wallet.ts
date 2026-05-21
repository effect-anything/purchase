import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SetupAttemptPaymentMethodDetailsCardWallet = Schema.Struct({
  apple_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsCardWalletApplePay, any, any> =>
        Models.PaymentMethodDetailsCardWalletApplePay as Schema.Schema<
          Models.PaymentMethodDetailsCardWalletApplePay,
          any,
          any
        >
    )
  ),
  google_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsCardWalletGooglePay, any, any> =>
        Models.PaymentMethodDetailsCardWalletGooglePay as Schema.Schema<
          Models.PaymentMethodDetailsCardWalletGooglePay,
          any,
          any
        >
    )
  ),
  type: Schema.Literal("apple_pay", "google_pay", "link")
})
export type SetupAttemptPaymentMethodDetailsCardWallet = typeof SetupAttemptPaymentMethodDetailsCardWallet.Type
