import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsCardWallet = Schema.Struct({
  amex_express_checkout: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodDetailsCardWalletAmexExpressCheckout => Models.PaymentMethodDetailsCardWalletAmexExpressCheckout)),
  apple_pay: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodDetailsCardWalletApplePay => Models.PaymentMethodDetailsCardWalletApplePay)),
  dynamic_last4: Schema.NullOr(Schema.String),
  google_pay: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodDetailsCardWalletGooglePay => Models.PaymentMethodDetailsCardWalletGooglePay)),
  link: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodDetailsCardWalletLink => Models.PaymentMethodDetailsCardWalletLink)),
  masterpass: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodDetailsCardWalletMasterpass => Models.PaymentMethodDetailsCardWalletMasterpass)),
  samsung_pay: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodDetailsCardWalletSamsungPay => Models.PaymentMethodDetailsCardWalletSamsungPay)),
  type: Schema.Literal("amex_express_checkout", "apple_pay", "google_pay", "link", "masterpass", "samsung_pay", "visa_checkout"),
  visa_checkout: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodDetailsCardWalletVisaCheckout => Models.PaymentMethodDetailsCardWalletVisaCheckout)),
})
export type PaymentMethodDetailsCardWallet = typeof PaymentMethodDetailsCardWallet.Type
