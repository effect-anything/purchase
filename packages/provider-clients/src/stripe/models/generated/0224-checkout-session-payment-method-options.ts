import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutSessionPaymentMethodOptions = Schema.Struct({
  acss_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutAcssDebitPaymentMethodOptions, any, any> =>
        Models.CheckoutAcssDebitPaymentMethodOptions as Schema.Schema<
          Models.CheckoutAcssDebitPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  affirm: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutAffirmPaymentMethodOptions, any, any> =>
        Models.CheckoutAffirmPaymentMethodOptions as Schema.Schema<Models.CheckoutAffirmPaymentMethodOptions, any, any>
    )
  ),
  afterpay_clearpay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutAfterpayClearpayPaymentMethodOptions, any, any> =>
        Models.CheckoutAfterpayClearpayPaymentMethodOptions as Schema.Schema<
          Models.CheckoutAfterpayClearpayPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  alipay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutAlipayPaymentMethodOptions, any, any> =>
        Models.CheckoutAlipayPaymentMethodOptions as Schema.Schema<Models.CheckoutAlipayPaymentMethodOptions, any, any>
    )
  ),
  alma: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutAlmaPaymentMethodOptions, any, any> =>
        Models.CheckoutAlmaPaymentMethodOptions as Schema.Schema<Models.CheckoutAlmaPaymentMethodOptions, any, any>
    )
  ),
  amazon_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutAmazonPayPaymentMethodOptions, any, any> =>
        Models.CheckoutAmazonPayPaymentMethodOptions as Schema.Schema<
          Models.CheckoutAmazonPayPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  au_becs_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutAuBecsDebitPaymentMethodOptions, any, any> =>
        Models.CheckoutAuBecsDebitPaymentMethodOptions as Schema.Schema<
          Models.CheckoutAuBecsDebitPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  bacs_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutBacsDebitPaymentMethodOptions, any, any> =>
        Models.CheckoutBacsDebitPaymentMethodOptions as Schema.Schema<
          Models.CheckoutBacsDebitPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  bancontact: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutBancontactPaymentMethodOptions, any, any> =>
        Models.CheckoutBancontactPaymentMethodOptions as Schema.Schema<
          Models.CheckoutBancontactPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  billie: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutBilliePaymentMethodOptions, any, any> =>
        Models.CheckoutBilliePaymentMethodOptions as Schema.Schema<Models.CheckoutBilliePaymentMethodOptions, any, any>
    )
  ),
  boleto: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutBoletoPaymentMethodOptions, any, any> =>
        Models.CheckoutBoletoPaymentMethodOptions as Schema.Schema<Models.CheckoutBoletoPaymentMethodOptions, any, any>
    )
  ),
  card: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutCardPaymentMethodOptions, any, any> =>
        Models.CheckoutCardPaymentMethodOptions as Schema.Schema<Models.CheckoutCardPaymentMethodOptions, any, any>
    )
  ),
  cashapp: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutCashappPaymentMethodOptions, any, any> =>
        Models.CheckoutCashappPaymentMethodOptions as Schema.Schema<
          Models.CheckoutCashappPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  customer_balance: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutCustomerBalancePaymentMethodOptions, any, any> =>
        Models.CheckoutCustomerBalancePaymentMethodOptions as Schema.Schema<
          Models.CheckoutCustomerBalancePaymentMethodOptions,
          any,
          any
        >
    )
  ),
  eps: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutEpsPaymentMethodOptions, any, any> =>
        Models.CheckoutEpsPaymentMethodOptions as Schema.Schema<Models.CheckoutEpsPaymentMethodOptions, any, any>
    )
  ),
  fpx: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutFpxPaymentMethodOptions, any, any> =>
        Models.CheckoutFpxPaymentMethodOptions as Schema.Schema<Models.CheckoutFpxPaymentMethodOptions, any, any>
    )
  ),
  giropay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutGiropayPaymentMethodOptions, any, any> =>
        Models.CheckoutGiropayPaymentMethodOptions as Schema.Schema<
          Models.CheckoutGiropayPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  grabpay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutGrabPayPaymentMethodOptions, any, any> =>
        Models.CheckoutGrabPayPaymentMethodOptions as Schema.Schema<
          Models.CheckoutGrabPayPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  ideal: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutIdealPaymentMethodOptions, any, any> =>
        Models.CheckoutIdealPaymentMethodOptions as Schema.Schema<Models.CheckoutIdealPaymentMethodOptions, any, any>
    )
  ),
  kakao_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutKakaoPayPaymentMethodOptions, any, any> =>
        Models.CheckoutKakaoPayPaymentMethodOptions as Schema.Schema<
          Models.CheckoutKakaoPayPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  klarna: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutKlarnaPaymentMethodOptions, any, any> =>
        Models.CheckoutKlarnaPaymentMethodOptions as Schema.Schema<Models.CheckoutKlarnaPaymentMethodOptions, any, any>
    )
  ),
  konbini: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutKonbiniPaymentMethodOptions, any, any> =>
        Models.CheckoutKonbiniPaymentMethodOptions as Schema.Schema<
          Models.CheckoutKonbiniPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  kr_card: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutKrCardPaymentMethodOptions, any, any> =>
        Models.CheckoutKrCardPaymentMethodOptions as Schema.Schema<Models.CheckoutKrCardPaymentMethodOptions, any, any>
    )
  ),
  link: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutLinkPaymentMethodOptions, any, any> =>
        Models.CheckoutLinkPaymentMethodOptions as Schema.Schema<Models.CheckoutLinkPaymentMethodOptions, any, any>
    )
  ),
  mobilepay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutMobilepayPaymentMethodOptions, any, any> =>
        Models.CheckoutMobilepayPaymentMethodOptions as Schema.Schema<
          Models.CheckoutMobilepayPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  multibanco: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutMultibancoPaymentMethodOptions, any, any> =>
        Models.CheckoutMultibancoPaymentMethodOptions as Schema.Schema<
          Models.CheckoutMultibancoPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  naver_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutNaverPayPaymentMethodOptions, any, any> =>
        Models.CheckoutNaverPayPaymentMethodOptions as Schema.Schema<
          Models.CheckoutNaverPayPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  oxxo: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutOxxoPaymentMethodOptions, any, any> =>
        Models.CheckoutOxxoPaymentMethodOptions as Schema.Schema<Models.CheckoutOxxoPaymentMethodOptions, any, any>
    )
  ),
  p24: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutP24PaymentMethodOptions, any, any> =>
        Models.CheckoutP24PaymentMethodOptions as Schema.Schema<Models.CheckoutP24PaymentMethodOptions, any, any>
    )
  ),
  payco: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutPaycoPaymentMethodOptions, any, any> =>
        Models.CheckoutPaycoPaymentMethodOptions as Schema.Schema<Models.CheckoutPaycoPaymentMethodOptions, any, any>
    )
  ),
  paynow: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutPaynowPaymentMethodOptions, any, any> =>
        Models.CheckoutPaynowPaymentMethodOptions as Schema.Schema<Models.CheckoutPaynowPaymentMethodOptions, any, any>
    )
  ),
  paypal: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutPaypalPaymentMethodOptions, any, any> =>
        Models.CheckoutPaypalPaymentMethodOptions as Schema.Schema<Models.CheckoutPaypalPaymentMethodOptions, any, any>
    )
  ),
  payto: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutPaytoPaymentMethodOptions, any, any> =>
        Models.CheckoutPaytoPaymentMethodOptions as Schema.Schema<Models.CheckoutPaytoPaymentMethodOptions, any, any>
    )
  ),
  pix: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutPixPaymentMethodOptions, any, any> =>
        Models.CheckoutPixPaymentMethodOptions as Schema.Schema<Models.CheckoutPixPaymentMethodOptions, any, any>
    )
  ),
  revolut_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutRevolutPayPaymentMethodOptions, any, any> =>
        Models.CheckoutRevolutPayPaymentMethodOptions as Schema.Schema<
          Models.CheckoutRevolutPayPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  samsung_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutSamsungPayPaymentMethodOptions, any, any> =>
        Models.CheckoutSamsungPayPaymentMethodOptions as Schema.Schema<
          Models.CheckoutSamsungPayPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  satispay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutSatispayPaymentMethodOptions, any, any> =>
        Models.CheckoutSatispayPaymentMethodOptions as Schema.Schema<
          Models.CheckoutSatispayPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  sepa_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutSepaDebitPaymentMethodOptions, any, any> =>
        Models.CheckoutSepaDebitPaymentMethodOptions as Schema.Schema<
          Models.CheckoutSepaDebitPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  sofort: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutSofortPaymentMethodOptions, any, any> =>
        Models.CheckoutSofortPaymentMethodOptions as Schema.Schema<Models.CheckoutSofortPaymentMethodOptions, any, any>
    )
  ),
  swish: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutSwishPaymentMethodOptions, any, any> =>
        Models.CheckoutSwishPaymentMethodOptions as Schema.Schema<Models.CheckoutSwishPaymentMethodOptions, any, any>
    )
  ),
  twint: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutTwintPaymentMethodOptions, any, any> =>
        Models.CheckoutTwintPaymentMethodOptions as Schema.Schema<Models.CheckoutTwintPaymentMethodOptions, any, any>
    )
  ),
  upi: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutUpiPaymentMethodOptions, any, any> =>
        Models.CheckoutUpiPaymentMethodOptions as Schema.Schema<Models.CheckoutUpiPaymentMethodOptions, any, any>
    )
  ),
  us_bank_account: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CheckoutUsBankAccountPaymentMethodOptions, any, any> =>
        Models.CheckoutUsBankAccountPaymentMethodOptions as Schema.Schema<
          Models.CheckoutUsBankAccountPaymentMethodOptions,
          any,
          any
        >
    )
  )
})
export type CheckoutSessionPaymentMethodOptions = typeof CheckoutSessionPaymentMethodOptions.Type
