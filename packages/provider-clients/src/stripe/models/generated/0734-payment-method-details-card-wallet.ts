import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsCardWallet = Schema.Struct({
  amex_express_checkout: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsCardWalletAmexExpressCheckout, any, any> =>
        Models.PaymentMethodDetailsCardWalletAmexExpressCheckout as Schema.Schema<
          Models.PaymentMethodDetailsCardWalletAmexExpressCheckout,
          any,
          any
        >
    )
  ),
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
  dynamic_last4: Schema.NullOr(Schema.String),
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
  link: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsCardWalletLink, any, any> =>
        Models.PaymentMethodDetailsCardWalletLink as Schema.Schema<Models.PaymentMethodDetailsCardWalletLink, any, any>
    )
  ),
  masterpass: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsCardWalletMasterpass, any, any> =>
        Models.PaymentMethodDetailsCardWalletMasterpass as Schema.Schema<
          Models.PaymentMethodDetailsCardWalletMasterpass,
          any,
          any
        >
    )
  ),
  samsung_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsCardWalletSamsungPay, any, any> =>
        Models.PaymentMethodDetailsCardWalletSamsungPay as Schema.Schema<
          Models.PaymentMethodDetailsCardWalletSamsungPay,
          any,
          any
        >
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
      (): Schema.Schema<Models.PaymentMethodDetailsCardWalletVisaCheckout, any, any> =>
        Models.PaymentMethodDetailsCardWalletVisaCheckout as Schema.Schema<
          Models.PaymentMethodDetailsCardWalletVisaCheckout,
          any,
          any
        >
    )
  )
})
export type PaymentMethodDetailsCardWallet = typeof PaymentMethodDetailsCardWallet.Type
