import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentPaymentMethodOptions = Schema.Struct({
  acss_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentPaymentMethodOptionsAcssDebit, any, any> =>
        Models.PaymentIntentPaymentMethodOptionsAcssDebit as Schema.Schema<
          Models.PaymentIntentPaymentMethodOptionsAcssDebit,
          any,
          any
        >
    )
  ),
  affirm: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsAffirm, any, any> =>
        Models.PaymentMethodOptionsAffirm as Schema.Schema<Models.PaymentMethodOptionsAffirm, any, any>
    )
  ),
  afterpay_clearpay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsAfterpayClearpay, any, any> =>
        Models.PaymentMethodOptionsAfterpayClearpay as Schema.Schema<
          Models.PaymentMethodOptionsAfterpayClearpay,
          any,
          any
        >
    )
  ),
  alipay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsAlipay, any, any> =>
        Models.PaymentMethodOptionsAlipay as Schema.Schema<Models.PaymentMethodOptionsAlipay, any, any>
    )
  ),
  alma: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsAlma, any, any> =>
        Models.PaymentMethodOptionsAlma as Schema.Schema<Models.PaymentMethodOptionsAlma, any, any>
    )
  ),
  amazon_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsAmazonPay, any, any> =>
        Models.PaymentMethodOptionsAmazonPay as Schema.Schema<Models.PaymentMethodOptionsAmazonPay, any, any>
    )
  ),
  au_becs_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentPaymentMethodOptionsAuBecsDebit, any, any> =>
        Models.PaymentIntentPaymentMethodOptionsAuBecsDebit as Schema.Schema<
          Models.PaymentIntentPaymentMethodOptionsAuBecsDebit,
          any,
          any
        >
    )
  ),
  bacs_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentPaymentMethodOptionsBacsDebit, any, any> =>
        Models.PaymentIntentPaymentMethodOptionsBacsDebit as Schema.Schema<
          Models.PaymentIntentPaymentMethodOptionsBacsDebit,
          any,
          any
        >
    )
  ),
  bancontact: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsBancontact, any, any> =>
        Models.PaymentMethodOptionsBancontact as Schema.Schema<Models.PaymentMethodOptionsBancontact, any, any>
    )
  ),
  billie: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsBillie, any, any> =>
        Models.PaymentMethodOptionsBillie as Schema.Schema<Models.PaymentMethodOptionsBillie, any, any>
    )
  ),
  blik: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentPaymentMethodOptionsBlik, any, any> =>
        Models.PaymentIntentPaymentMethodOptionsBlik as Schema.Schema<
          Models.PaymentIntentPaymentMethodOptionsBlik,
          any,
          any
        >
    )
  ),
  boleto: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsBoleto, any, any> =>
        Models.PaymentMethodOptionsBoleto as Schema.Schema<Models.PaymentMethodOptionsBoleto, any, any>
    )
  ),
  card: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentPaymentMethodOptionsCard, any, any> =>
        Models.PaymentIntentPaymentMethodOptionsCard as Schema.Schema<
          Models.PaymentIntentPaymentMethodOptionsCard,
          any,
          any
        >
    )
  ),
  card_present: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsCardPresent, any, any> =>
        Models.PaymentMethodOptionsCardPresent as Schema.Schema<Models.PaymentMethodOptionsCardPresent, any, any>
    )
  ),
  cashapp: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsCashapp, any, any> =>
        Models.PaymentMethodOptionsCashapp as Schema.Schema<Models.PaymentMethodOptionsCashapp, any, any>
    )
  ),
  crypto: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsCrypto, any, any> =>
        Models.PaymentMethodOptionsCrypto as Schema.Schema<Models.PaymentMethodOptionsCrypto, any, any>
    )
  ),
  customer_balance: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsCustomerBalance, any, any> =>
        Models.PaymentMethodOptionsCustomerBalance as Schema.Schema<
          Models.PaymentMethodOptionsCustomerBalance,
          any,
          any
        >
    )
  ),
  eps: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentPaymentMethodOptionsEps, any, any> =>
        Models.PaymentIntentPaymentMethodOptionsEps as Schema.Schema<
          Models.PaymentIntentPaymentMethodOptionsEps,
          any,
          any
        >
    )
  ),
  fpx: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsFpx, any, any> =>
        Models.PaymentMethodOptionsFpx as Schema.Schema<Models.PaymentMethodOptionsFpx, any, any>
    )
  ),
  giropay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsGiropay, any, any> =>
        Models.PaymentMethodOptionsGiropay as Schema.Schema<Models.PaymentMethodOptionsGiropay, any, any>
    )
  ),
  grabpay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsGrabpay, any, any> =>
        Models.PaymentMethodOptionsGrabpay as Schema.Schema<Models.PaymentMethodOptionsGrabpay, any, any>
    )
  ),
  ideal: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsIdeal, any, any> =>
        Models.PaymentMethodOptionsIdeal as Schema.Schema<Models.PaymentMethodOptionsIdeal, any, any>
    )
  ),
  interac_present: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsInteracPresent, any, any> =>
        Models.PaymentMethodOptionsInteracPresent as Schema.Schema<Models.PaymentMethodOptionsInteracPresent, any, any>
    )
  ),
  kakao_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentFlowsPrivatePaymentMethodsKakaoPayPaymentMethodOptions, any, any> =>
        Models.PaymentFlowsPrivatePaymentMethodsKakaoPayPaymentMethodOptions as Schema.Schema<
          Models.PaymentFlowsPrivatePaymentMethodsKakaoPayPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  klarna: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsKlarna, any, any> =>
        Models.PaymentMethodOptionsKlarna as Schema.Schema<Models.PaymentMethodOptionsKlarna, any, any>
    )
  ),
  konbini: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsKonbini, any, any> =>
        Models.PaymentMethodOptionsKonbini as Schema.Schema<Models.PaymentMethodOptionsKonbini, any, any>
    )
  ),
  kr_card: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsKrCard, any, any> =>
        Models.PaymentMethodOptionsKrCard as Schema.Schema<Models.PaymentMethodOptionsKrCard, any, any>
    )
  ),
  link: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentPaymentMethodOptionsLink, any, any> =>
        Models.PaymentIntentPaymentMethodOptionsLink as Schema.Schema<
          Models.PaymentIntentPaymentMethodOptionsLink,
          any,
          any
        >
    )
  ),
  mb_way: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsMbWay, any, any> =>
        Models.PaymentMethodOptionsMbWay as Schema.Schema<Models.PaymentMethodOptionsMbWay, any, any>
    )
  ),
  mobilepay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentPaymentMethodOptionsMobilepay, any, any> =>
        Models.PaymentIntentPaymentMethodOptionsMobilepay as Schema.Schema<
          Models.PaymentIntentPaymentMethodOptionsMobilepay,
          any,
          any
        >
    )
  ),
  multibanco: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsMultibanco, any, any> =>
        Models.PaymentMethodOptionsMultibanco as Schema.Schema<Models.PaymentMethodOptionsMultibanco, any, any>
    )
  ),
  naver_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentFlowsPrivatePaymentMethodsNaverPayPaymentMethodOptions, any, any> =>
        Models.PaymentFlowsPrivatePaymentMethodsNaverPayPaymentMethodOptions as Schema.Schema<
          Models.PaymentFlowsPrivatePaymentMethodsNaverPayPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  nz_bank_account: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentPaymentMethodOptionsNzBankAccount, any, any> =>
        Models.PaymentIntentPaymentMethodOptionsNzBankAccount as Schema.Schema<
          Models.PaymentIntentPaymentMethodOptionsNzBankAccount,
          any,
          any
        >
    )
  ),
  oxxo: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsOxxo, any, any> =>
        Models.PaymentMethodOptionsOxxo as Schema.Schema<Models.PaymentMethodOptionsOxxo, any, any>
    )
  ),
  p24: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsP24, any, any> =>
        Models.PaymentMethodOptionsP24 as Schema.Schema<Models.PaymentMethodOptionsP24, any, any>
    )
  ),
  pay_by_bank: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsPayByBank, any, any> =>
        Models.PaymentMethodOptionsPayByBank as Schema.Schema<Models.PaymentMethodOptionsPayByBank, any, any>
    )
  ),
  payco: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentFlowsPrivatePaymentMethodsPaycoPaymentMethodOptions, any, any> =>
        Models.PaymentFlowsPrivatePaymentMethodsPaycoPaymentMethodOptions as Schema.Schema<
          Models.PaymentFlowsPrivatePaymentMethodsPaycoPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  paynow: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsPaynow, any, any> =>
        Models.PaymentMethodOptionsPaynow as Schema.Schema<Models.PaymentMethodOptionsPaynow, any, any>
    )
  ),
  paypal: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsPaypal, any, any> =>
        Models.PaymentMethodOptionsPaypal as Schema.Schema<Models.PaymentMethodOptionsPaypal, any, any>
    )
  ),
  payto: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentPaymentMethodOptionsPayto, any, any> =>
        Models.PaymentIntentPaymentMethodOptionsPayto as Schema.Schema<
          Models.PaymentIntentPaymentMethodOptionsPayto,
          any,
          any
        >
    )
  ),
  pix: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsPix, any, any> =>
        Models.PaymentMethodOptionsPix as Schema.Schema<Models.PaymentMethodOptionsPix, any, any>
    )
  ),
  promptpay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsPromptpay, any, any> =>
        Models.PaymentMethodOptionsPromptpay as Schema.Schema<Models.PaymentMethodOptionsPromptpay, any, any>
    )
  ),
  revolut_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsRevolutPay, any, any> =>
        Models.PaymentMethodOptionsRevolutPay as Schema.Schema<Models.PaymentMethodOptionsRevolutPay, any, any>
    )
  ),
  samsung_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentFlowsPrivatePaymentMethodsSamsungPayPaymentMethodOptions, any, any> =>
        Models.PaymentFlowsPrivatePaymentMethodsSamsungPayPaymentMethodOptions as Schema.Schema<
          Models.PaymentFlowsPrivatePaymentMethodsSamsungPayPaymentMethodOptions,
          any,
          any
        >
    )
  ),
  satispay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsSatispay, any, any> =>
        Models.PaymentMethodOptionsSatispay as Schema.Schema<Models.PaymentMethodOptionsSatispay, any, any>
    )
  ),
  sepa_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentPaymentMethodOptionsSepaDebit, any, any> =>
        Models.PaymentIntentPaymentMethodOptionsSepaDebit as Schema.Schema<
          Models.PaymentIntentPaymentMethodOptionsSepaDebit,
          any,
          any
        >
    )
  ),
  sofort: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsSofort, any, any> =>
        Models.PaymentMethodOptionsSofort as Schema.Schema<Models.PaymentMethodOptionsSofort, any, any>
    )
  ),
  swish: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentPaymentMethodOptionsSwish, any, any> =>
        Models.PaymentIntentPaymentMethodOptionsSwish as Schema.Schema<
          Models.PaymentIntentPaymentMethodOptionsSwish,
          any,
          any
        >
    )
  ),
  twint: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsTwint, any, any> =>
        Models.PaymentMethodOptionsTwint as Schema.Schema<Models.PaymentMethodOptionsTwint, any, any>
    )
  ),
  upi: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsUpi, any, any> =>
        Models.PaymentMethodOptionsUpi as Schema.Schema<Models.PaymentMethodOptionsUpi, any, any>
    )
  ),
  us_bank_account: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentPaymentMethodOptionsUsBankAccount, any, any> =>
        Models.PaymentIntentPaymentMethodOptionsUsBankAccount as Schema.Schema<
          Models.PaymentIntentPaymentMethodOptionsUsBankAccount,
          any,
          any
        >
    )
  ),
  wechat_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsWechatPay, any, any> =>
        Models.PaymentMethodOptionsWechatPay as Schema.Schema<Models.PaymentMethodOptionsWechatPay, any, any>
    )
  ),
  zip: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOptionsZip, any, any> =>
        Models.PaymentMethodOptionsZip as Schema.Schema<Models.PaymentMethodOptionsZip, any, any>
    )
  )
})
export type PaymentIntentPaymentMethodOptions = typeof PaymentIntentPaymentMethodOptions.Type
