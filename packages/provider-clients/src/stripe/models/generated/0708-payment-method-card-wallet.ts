import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodCardWallet = Schema.Struct({
  amex_express_checkout: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodCardWalletAmexExpressCheckout => Models.PaymentMethodCardWalletAmexExpressCheckout)),
  apple_pay: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodCardWalletApplePay => Models.PaymentMethodCardWalletApplePay)),
  dynamic_last4: Schema.NullOr(Schema.String),
  google_pay: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodCardWalletGooglePay => Models.PaymentMethodCardWalletGooglePay)),
  link: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodCardWalletLink => Models.PaymentMethodCardWalletLink)),
  masterpass: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodCardWalletMasterpass => Models.PaymentMethodCardWalletMasterpass)),
  samsung_pay: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodCardWalletSamsungPay => Models.PaymentMethodCardWalletSamsungPay)),
  type: Schema.Literal("amex_express_checkout", "apple_pay", "google_pay", "link", "masterpass", "samsung_pay", "visa_checkout"),
  visa_checkout: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodCardWalletVisaCheckout => Models.PaymentMethodCardWalletVisaCheckout)),
})
export type PaymentMethodCardWallet = typeof PaymentMethodCardWallet.Type
