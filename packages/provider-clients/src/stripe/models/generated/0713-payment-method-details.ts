import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type PaymentMethodDetails = {
  readonly ach_credit_transfer?: Models.PaymentMethodDetailsAchCreditTransfer
  readonly ach_debit?: Models.PaymentMethodDetailsAchDebit
  readonly acss_debit?: Models.PaymentMethodDetailsAcssDebit
  readonly affirm?: Models.PaymentMethodDetailsAffirm
  readonly afterpay_clearpay?: Models.PaymentMethodDetailsAfterpayClearpay
  readonly alipay?: Models.PaymentFlowsPrivatePaymentMethodsAlipayDetails
  readonly alma?: Models.PaymentMethodDetailsAlma
  readonly amazon_pay?: Models.PaymentMethodDetailsAmazonPay
  readonly au_becs_debit?: Models.PaymentMethodDetailsAuBecsDebit
  readonly bacs_debit?: Models.PaymentMethodDetailsBacsDebit
  readonly bancontact?: Models.PaymentMethodDetailsBancontact
  readonly billie?: Models.PaymentMethodDetailsBillie
  readonly blik?: Models.PaymentMethodDetailsBlik
  readonly boleto?: Models.PaymentMethodDetailsBoleto
  readonly card?: Models.PaymentMethodDetailsCard
  readonly card_present?: Models.PaymentMethodDetailsCardPresent
  readonly cashapp?: Models.PaymentMethodDetailsCashapp
  readonly crypto?: Models.PaymentMethodDetailsCrypto
  readonly customer_balance?: Models.PaymentMethodDetailsCustomerBalance
  readonly eps?: Models.PaymentMethodDetailsEps
  readonly fpx?: Models.PaymentMethodDetailsFpx
  readonly giropay?: Models.PaymentMethodDetailsGiropay
  readonly grabpay?: Models.PaymentMethodDetailsGrabpay
  readonly ideal?: Models.PaymentMethodDetailsIdeal
  readonly interac_present?: Models.PaymentMethodDetailsInteracPresent
  readonly kakao_pay?: Models.PaymentMethodDetailsKakaoPay
  readonly klarna?: Models.PaymentMethodDetailsKlarna
  readonly konbini?: Models.PaymentMethodDetailsKonbini
  readonly kr_card?: Models.PaymentMethodDetailsKrCard
  readonly link?: Models.PaymentMethodDetailsLink
  readonly mb_way?: Models.PaymentMethodDetailsMbWay
  readonly mobilepay?: Models.PaymentMethodDetailsMobilepay
  readonly multibanco?: Models.PaymentMethodDetailsMultibanco
  readonly naver_pay?: Models.PaymentMethodDetailsNaverPay
  readonly nz_bank_account?: Models.PaymentMethodDetailsNzBankAccount
  readonly oxxo?: Models.PaymentMethodDetailsOxxo
  readonly p24?: Models.PaymentMethodDetailsP24
  readonly pay_by_bank?: Models.PaymentMethodDetailsPayByBank
  readonly payco?: Models.PaymentMethodDetailsPayco
  readonly paynow?: Models.PaymentMethodDetailsPaynow
  readonly paypal?: Models.PaymentMethodDetailsPaypal
  readonly payto?: Models.PaymentMethodDetailsPayto
  readonly pix?: Models.PaymentMethodDetailsPix
  readonly promptpay?: Models.PaymentMethodDetailsPromptpay
  readonly revolut_pay?: Models.PaymentMethodDetailsRevolutPay
  readonly samsung_pay?: Models.PaymentMethodDetailsSamsungPay
  readonly satispay?: Models.PaymentMethodDetailsSatispay
  readonly sepa_credit_transfer?: Models.PaymentMethodDetailsSepaCreditTransfer
  readonly sepa_debit?: Models.PaymentMethodDetailsSepaDebit
  readonly sofort?: Models.PaymentMethodDetailsSofort
  readonly stripe_account?: Models.PaymentMethodDetailsStripeAccount
  readonly sunbit?: Models.PaymentMethodDetailsSunbit
  readonly swish?: Models.PaymentMethodDetailsSwish
  readonly twint?: Models.PaymentMethodDetailsTwint
  readonly type: string
  readonly upi?: Models.PaymentMethodDetailsUpi
  readonly us_bank_account?: Models.PaymentMethodDetailsUsBankAccount
  readonly wechat?: Models.PaymentMethodDetailsWechat
  readonly wechat_pay?: Models.PaymentMethodDetailsWechatPay
  readonly zip?: Models.PaymentMethodDetailsZip
}

export const PaymentMethodDetails = Schema.Struct({
  ach_credit_transfer: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsAchCreditTransfer, any, any> =>
        Models.PaymentMethodDetailsAchCreditTransfer as Schema.Schema<
          Models.PaymentMethodDetailsAchCreditTransfer,
          any,
          any
        >
    )
  ),
  ach_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsAchDebit, any, any> =>
        Models.PaymentMethodDetailsAchDebit as Schema.Schema<Models.PaymentMethodDetailsAchDebit, any, any>
    )
  ),
  acss_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsAcssDebit, any, any> =>
        Models.PaymentMethodDetailsAcssDebit as Schema.Schema<Models.PaymentMethodDetailsAcssDebit, any, any>
    )
  ),
  affirm: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsAffirm, any, any> =>
        Models.PaymentMethodDetailsAffirm as Schema.Schema<Models.PaymentMethodDetailsAffirm, any, any>
    )
  ),
  afterpay_clearpay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsAfterpayClearpay, any, any> =>
        Models.PaymentMethodDetailsAfterpayClearpay as Schema.Schema<
          Models.PaymentMethodDetailsAfterpayClearpay,
          any,
          any
        >
    )
  ),
  alipay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentFlowsPrivatePaymentMethodsAlipayDetails, any, any> =>
        Models.PaymentFlowsPrivatePaymentMethodsAlipayDetails as Schema.Schema<
          Models.PaymentFlowsPrivatePaymentMethodsAlipayDetails,
          any,
          any
        >
    )
  ),
  alma: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsAlma, any, any> =>
        Models.PaymentMethodDetailsAlma as Schema.Schema<Models.PaymentMethodDetailsAlma, any, any>
    )
  ),
  amazon_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsAmazonPay, any, any> =>
        Models.PaymentMethodDetailsAmazonPay as Schema.Schema<Models.PaymentMethodDetailsAmazonPay, any, any>
    )
  ),
  au_becs_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsAuBecsDebit, any, any> =>
        Models.PaymentMethodDetailsAuBecsDebit as Schema.Schema<Models.PaymentMethodDetailsAuBecsDebit, any, any>
    )
  ),
  bacs_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsBacsDebit, any, any> =>
        Models.PaymentMethodDetailsBacsDebit as Schema.Schema<Models.PaymentMethodDetailsBacsDebit, any, any>
    )
  ),
  bancontact: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsBancontact, any, any> =>
        Models.PaymentMethodDetailsBancontact as Schema.Schema<Models.PaymentMethodDetailsBancontact, any, any>
    )
  ),
  billie: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsBillie, any, any> =>
        Models.PaymentMethodDetailsBillie as Schema.Schema<Models.PaymentMethodDetailsBillie, any, any>
    )
  ),
  blik: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsBlik, any, any> =>
        Models.PaymentMethodDetailsBlik as Schema.Schema<Models.PaymentMethodDetailsBlik, any, any>
    )
  ),
  boleto: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsBoleto, any, any> =>
        Models.PaymentMethodDetailsBoleto as Schema.Schema<Models.PaymentMethodDetailsBoleto, any, any>
    )
  ),
  card: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsCard, any, any> =>
        Models.PaymentMethodDetailsCard as Schema.Schema<Models.PaymentMethodDetailsCard, any, any>
    )
  ),
  card_present: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsCardPresent, any, any> =>
        Models.PaymentMethodDetailsCardPresent as Schema.Schema<Models.PaymentMethodDetailsCardPresent, any, any>
    )
  ),
  cashapp: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsCashapp, any, any> =>
        Models.PaymentMethodDetailsCashapp as Schema.Schema<Models.PaymentMethodDetailsCashapp, any, any>
    )
  ),
  crypto: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsCrypto, any, any> =>
        Models.PaymentMethodDetailsCrypto as Schema.Schema<Models.PaymentMethodDetailsCrypto, any, any>
    )
  ),
  customer_balance: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsCustomerBalance, any, any> =>
        Models.PaymentMethodDetailsCustomerBalance as Schema.Schema<
          Models.PaymentMethodDetailsCustomerBalance,
          any,
          any
        >
    )
  ),
  eps: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsEps, any, any> =>
        Models.PaymentMethodDetailsEps as Schema.Schema<Models.PaymentMethodDetailsEps, any, any>
    )
  ),
  fpx: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsFpx, any, any> =>
        Models.PaymentMethodDetailsFpx as Schema.Schema<Models.PaymentMethodDetailsFpx, any, any>
    )
  ),
  giropay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsGiropay, any, any> =>
        Models.PaymentMethodDetailsGiropay as Schema.Schema<Models.PaymentMethodDetailsGiropay, any, any>
    )
  ),
  grabpay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsGrabpay, any, any> =>
        Models.PaymentMethodDetailsGrabpay as Schema.Schema<Models.PaymentMethodDetailsGrabpay, any, any>
    )
  ),
  ideal: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsIdeal, any, any> =>
        Models.PaymentMethodDetailsIdeal as Schema.Schema<Models.PaymentMethodDetailsIdeal, any, any>
    )
  ),
  interac_present: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsInteracPresent, any, any> =>
        Models.PaymentMethodDetailsInteracPresent as Schema.Schema<Models.PaymentMethodDetailsInteracPresent, any, any>
    )
  ),
  kakao_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsKakaoPay, any, any> =>
        Models.PaymentMethodDetailsKakaoPay as Schema.Schema<Models.PaymentMethodDetailsKakaoPay, any, any>
    )
  ),
  klarna: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsKlarna, any, any> =>
        Models.PaymentMethodDetailsKlarna as Schema.Schema<Models.PaymentMethodDetailsKlarna, any, any>
    )
  ),
  konbini: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsKonbini, any, any> =>
        Models.PaymentMethodDetailsKonbini as Schema.Schema<Models.PaymentMethodDetailsKonbini, any, any>
    )
  ),
  kr_card: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsKrCard, any, any> =>
        Models.PaymentMethodDetailsKrCard as Schema.Schema<Models.PaymentMethodDetailsKrCard, any, any>
    )
  ),
  link: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsLink, any, any> =>
        Models.PaymentMethodDetailsLink as Schema.Schema<Models.PaymentMethodDetailsLink, any, any>
    )
  ),
  mb_way: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsMbWay, any, any> =>
        Models.PaymentMethodDetailsMbWay as Schema.Schema<Models.PaymentMethodDetailsMbWay, any, any>
    )
  ),
  mobilepay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsMobilepay, any, any> =>
        Models.PaymentMethodDetailsMobilepay as Schema.Schema<Models.PaymentMethodDetailsMobilepay, any, any>
    )
  ),
  multibanco: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsMultibanco, any, any> =>
        Models.PaymentMethodDetailsMultibanco as Schema.Schema<Models.PaymentMethodDetailsMultibanco, any, any>
    )
  ),
  naver_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsNaverPay, any, any> =>
        Models.PaymentMethodDetailsNaverPay as Schema.Schema<Models.PaymentMethodDetailsNaverPay, any, any>
    )
  ),
  nz_bank_account: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsNzBankAccount, any, any> =>
        Models.PaymentMethodDetailsNzBankAccount as Schema.Schema<Models.PaymentMethodDetailsNzBankAccount, any, any>
    )
  ),
  oxxo: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsOxxo, any, any> =>
        Models.PaymentMethodDetailsOxxo as Schema.Schema<Models.PaymentMethodDetailsOxxo, any, any>
    )
  ),
  p24: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsP24, any, any> =>
        Models.PaymentMethodDetailsP24 as Schema.Schema<Models.PaymentMethodDetailsP24, any, any>
    )
  ),
  pay_by_bank: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPayByBank, any, any> =>
        Models.PaymentMethodDetailsPayByBank as Schema.Schema<Models.PaymentMethodDetailsPayByBank, any, any>
    )
  ),
  payco: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPayco, any, any> =>
        Models.PaymentMethodDetailsPayco as Schema.Schema<Models.PaymentMethodDetailsPayco, any, any>
    )
  ),
  paynow: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPaynow, any, any> =>
        Models.PaymentMethodDetailsPaynow as Schema.Schema<Models.PaymentMethodDetailsPaynow, any, any>
    )
  ),
  paypal: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPaypal, any, any> =>
        Models.PaymentMethodDetailsPaypal as Schema.Schema<Models.PaymentMethodDetailsPaypal, any, any>
    )
  ),
  payto: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPayto, any, any> =>
        Models.PaymentMethodDetailsPayto as Schema.Schema<Models.PaymentMethodDetailsPayto, any, any>
    )
  ),
  pix: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPix, any, any> =>
        Models.PaymentMethodDetailsPix as Schema.Schema<Models.PaymentMethodDetailsPix, any, any>
    )
  ),
  promptpay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPromptpay, any, any> =>
        Models.PaymentMethodDetailsPromptpay as Schema.Schema<Models.PaymentMethodDetailsPromptpay, any, any>
    )
  ),
  revolut_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsRevolutPay, any, any> =>
        Models.PaymentMethodDetailsRevolutPay as Schema.Schema<Models.PaymentMethodDetailsRevolutPay, any, any>
    )
  ),
  samsung_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsSamsungPay, any, any> =>
        Models.PaymentMethodDetailsSamsungPay as Schema.Schema<Models.PaymentMethodDetailsSamsungPay, any, any>
    )
  ),
  satispay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsSatispay, any, any> =>
        Models.PaymentMethodDetailsSatispay as Schema.Schema<Models.PaymentMethodDetailsSatispay, any, any>
    )
  ),
  sepa_credit_transfer: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsSepaCreditTransfer, any, any> =>
        Models.PaymentMethodDetailsSepaCreditTransfer as Schema.Schema<
          Models.PaymentMethodDetailsSepaCreditTransfer,
          any,
          any
        >
    )
  ),
  sepa_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsSepaDebit, any, any> =>
        Models.PaymentMethodDetailsSepaDebit as Schema.Schema<Models.PaymentMethodDetailsSepaDebit, any, any>
    )
  ),
  sofort: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsSofort, any, any> =>
        Models.PaymentMethodDetailsSofort as Schema.Schema<Models.PaymentMethodDetailsSofort, any, any>
    )
  ),
  stripe_account: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsStripeAccount, any, any> =>
        Models.PaymentMethodDetailsStripeAccount as Schema.Schema<Models.PaymentMethodDetailsStripeAccount, any, any>
    )
  ),
  sunbit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsSunbit, any, any> =>
        Models.PaymentMethodDetailsSunbit as Schema.Schema<Models.PaymentMethodDetailsSunbit, any, any>
    )
  ),
  swish: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsSwish, any, any> =>
        Models.PaymentMethodDetailsSwish as Schema.Schema<Models.PaymentMethodDetailsSwish, any, any>
    )
  ),
  twint: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsTwint, any, any> =>
        Models.PaymentMethodDetailsTwint as Schema.Schema<Models.PaymentMethodDetailsTwint, any, any>
    )
  ),
  type: Schema.String,
  upi: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsUpi, any, any> =>
        Models.PaymentMethodDetailsUpi as Schema.Schema<Models.PaymentMethodDetailsUpi, any, any>
    )
  ),
  us_bank_account: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsUsBankAccount, any, any> =>
        Models.PaymentMethodDetailsUsBankAccount as Schema.Schema<Models.PaymentMethodDetailsUsBankAccount, any, any>
    )
  ),
  wechat: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsWechat, any, any> =>
        Models.PaymentMethodDetailsWechat as Schema.Schema<Models.PaymentMethodDetailsWechat, any, any>
    )
  ),
  wechat_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsWechatPay, any, any> =>
        Models.PaymentMethodDetailsWechatPay as Schema.Schema<Models.PaymentMethodDetailsWechatPay, any, any>
    )
  ),
  zip: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsZip, any, any> =>
        Models.PaymentMethodDetailsZip as Schema.Schema<Models.PaymentMethodDetailsZip, any, any>
    )
  )
})
