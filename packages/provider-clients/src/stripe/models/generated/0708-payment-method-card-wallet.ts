import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodCardWallet = Schema.Struct({
  amex_express_checkout: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodCardWalletAmexExpressCheckout, any, any> =>
        Models.PaymentMethodCardWalletAmexExpressCheckout as Schema.Schema<
          Models.PaymentMethodCardWalletAmexExpressCheckout,
          any,
          any
        >
    )
  ),
  apple_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodCardWalletApplePay, any, any> =>
        Models.PaymentMethodCardWalletApplePay as Schema.Schema<Models.PaymentMethodCardWalletApplePay, any, any>
    )
  ),
  dynamic_last4: Schema.NullOr(Schema.String),
  google_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodCardWalletGooglePay, any, any> =>
        Models.PaymentMethodCardWalletGooglePay as Schema.Schema<Models.PaymentMethodCardWalletGooglePay, any, any>
    )
  ),
  link: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodCardWalletLink, any, any> =>
        Models.PaymentMethodCardWalletLink as Schema.Schema<Models.PaymentMethodCardWalletLink, any, any>
    )
  ),
  masterpass: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodCardWalletMasterpass, any, any> =>
        Models.PaymentMethodCardWalletMasterpass as Schema.Schema<Models.PaymentMethodCardWalletMasterpass, any, any>
    )
  ),
  samsung_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodCardWalletSamsungPay, any, any> =>
        Models.PaymentMethodCardWalletSamsungPay as Schema.Schema<Models.PaymentMethodCardWalletSamsungPay, any, any>
    )
  ),
  type: Schema.Literal(
    "amex_express_checkout",
    "apple_pay",
    "google_pay",
    "link",
    "masterpass",
    "samsung_pay",
    "visa_checkout"
  ),
  visa_checkout: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodCardWalletVisaCheckout, any, any> =>
        Models.PaymentMethodCardWalletVisaCheckout as Schema.Schema<
          Models.PaymentMethodCardWalletVisaCheckout,
          any,
          any
        >
    )
  )
})
export type PaymentMethodCardWallet = typeof PaymentMethodCardWallet.Type
