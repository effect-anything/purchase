import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SetupAttemptPaymentMethodDetailsCardWallet = Schema.Struct({
  apple_pay: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodDetailsCardWalletApplePay => Models.PaymentMethodDetailsCardWalletApplePay)),
  google_pay: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodDetailsCardWalletGooglePay => Models.PaymentMethodDetailsCardWalletGooglePay)),
  type: Schema.Literal("apple_pay", "google_pay", "link"),
})
export type SetupAttemptPaymentMethodDetailsCardWallet = typeof SetupAttemptPaymentMethodDetailsCardWallet.Type
