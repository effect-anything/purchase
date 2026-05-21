import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type PaymentMethod = {
  readonly acss_debit?: Models.PaymentMethodAcssDebit
  readonly affirm?: Models.PaymentMethodAffirm
  readonly afterpay_clearpay?: Models.PaymentMethodAfterpayClearpay
  readonly alipay?: Models.PaymentFlowsPrivatePaymentMethodsAlipay
  readonly allow_redisplay?: "always" | "limited" | "unspecified"
  readonly alma?: Models.PaymentMethodAlma
  readonly amazon_pay?: Models.PaymentMethodAmazonPay
  readonly au_becs_debit?: Models.PaymentMethodAuBecsDebit
  readonly bacs_debit?: Models.PaymentMethodBacsDebit
  readonly bancontact?: Models.PaymentMethodBancontact
  readonly billie?: Models.PaymentMethodBillie
  readonly billing_details: Models.BillingDetails
  readonly blik?: Models.PaymentMethodBlik
  readonly boleto?: Models.PaymentMethodBoleto
  readonly card?: Models.PaymentMethodCard
  readonly card_present?: Models.PaymentMethodCardPresent
  readonly cashapp?: Models.PaymentMethodCashapp
  readonly created: number
  readonly crypto?: Models.PaymentMethodCrypto
  readonly custom?: Models.PaymentMethodCustom
  readonly customer: string | Models.Customer | null
  readonly customer_account: string | null
  readonly customer_balance?: Models.PaymentMethodCustomerBalance
  readonly eps?: Models.PaymentMethodEps
  readonly fpx?: Models.PaymentMethodFpx
  readonly giropay?: Models.PaymentMethodGiropay
  readonly grabpay?: Models.PaymentMethodGrabpay
  readonly id: string
  readonly ideal?: Models.PaymentMethodIdeal
  readonly interac_present?: Models.PaymentMethodInteracPresent
  readonly kakao_pay?: Models.PaymentMethodKakaoPay
  readonly klarna?: Models.PaymentMethodKlarna
  readonly konbini?: Models.PaymentMethodKonbini
  readonly kr_card?: Models.PaymentMethodKrCard
  readonly link?: Models.PaymentMethodLink
  readonly livemode: boolean
  readonly mb_way?: Models.PaymentMethodMbWay
  readonly metadata: Readonly<Record<string, string>> | null
  readonly mobilepay?: Models.PaymentMethodMobilepay
  readonly multibanco?: Models.PaymentMethodMultibanco
  readonly naver_pay?: Models.PaymentMethodNaverPay
  readonly nz_bank_account?: Models.PaymentMethodNzBankAccount
  readonly object: "payment_method"
  readonly oxxo?: Models.PaymentMethodOxxo
  readonly p24?: Models.PaymentMethodP24
  readonly pay_by_bank?: Models.PaymentMethodPayByBank
  readonly payco?: Models.PaymentMethodPayco
  readonly paynow?: Models.PaymentMethodPaynow
  readonly paypal?: Models.PaymentMethodPaypal
  readonly payto?: Models.PaymentMethodPayto
  readonly pix?: Models.PaymentMethodPix
  readonly promptpay?: Models.PaymentMethodPromptpay
  readonly radar_options?: Models.RadarRadarOptions
  readonly revolut_pay?: Models.PaymentMethodRevolutPay
  readonly samsung_pay?: Models.PaymentMethodSamsungPay
  readonly satispay?: Models.PaymentMethodSatispay
  readonly sepa_debit?: Models.PaymentMethodSepaDebit
  readonly sofort?: Models.PaymentMethodSofort
  readonly sunbit?: Models.PaymentMethodSunbit
  readonly swish?: Models.PaymentMethodSwish
  readonly twint?: Models.PaymentMethodTwint
  readonly type:
    | "acss_debit"
    | "affirm"
    | "afterpay_clearpay"
    | "alipay"
    | "alma"
    | "amazon_pay"
    | "au_becs_debit"
    | "bacs_debit"
    | "bancontact"
    | "billie"
    | "blik"
    | "boleto"
    | "card"
    | "card_present"
    | "cashapp"
    | "crypto"
    | "custom"
    | "customer_balance"
    | "eps"
    | "fpx"
    | "giropay"
    | "grabpay"
    | "ideal"
    | "interac_present"
    | "kakao_pay"
    | "klarna"
    | "konbini"
    | "kr_card"
    | "link"
    | "mb_way"
    | "mobilepay"
    | "multibanco"
    | "naver_pay"
    | "nz_bank_account"
    | "oxxo"
    | "p24"
    | "pay_by_bank"
    | "payco"
    | "paynow"
    | "paypal"
    | "payto"
    | "pix"
    | "promptpay"
    | "revolut_pay"
    | "samsung_pay"
    | "satispay"
    | "sepa_debit"
    | "sofort"
    | "sunbit"
    | "swish"
    | "twint"
    | "upi"
    | "us_bank_account"
    | "wechat_pay"
    | "zip"
  readonly upi?: Models.PaymentMethodUpi
  readonly us_bank_account?: Models.PaymentMethodUsBankAccount
  readonly wechat_pay?: Models.PaymentMethodWechatPay
  readonly zip?: Models.PaymentMethodZip
}

export const PaymentMethod = Schema.Struct({
  acss_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodAcssDebit, any, any> =>
        Models.PaymentMethodAcssDebit as Schema.Schema<Models.PaymentMethodAcssDebit, any, any>
    )
  ),
  affirm: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodAffirm, any, any> =>
        Models.PaymentMethodAffirm as Schema.Schema<Models.PaymentMethodAffirm, any, any>
    )
  ),
  afterpay_clearpay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodAfterpayClearpay, any, any> =>
        Models.PaymentMethodAfterpayClearpay as Schema.Schema<Models.PaymentMethodAfterpayClearpay, any, any>
    )
  ),
  alipay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentFlowsPrivatePaymentMethodsAlipay, any, any> =>
        Models.PaymentFlowsPrivatePaymentMethodsAlipay as Schema.Schema<
          Models.PaymentFlowsPrivatePaymentMethodsAlipay,
          any,
          any
        >
    )
  ),
  allow_redisplay: Schema.optional(Schema.Literal("always", "limited", "unspecified")),
  alma: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodAlma, any, any> =>
        Models.PaymentMethodAlma as Schema.Schema<Models.PaymentMethodAlma, any, any>
    )
  ),
  amazon_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodAmazonPay, any, any> =>
        Models.PaymentMethodAmazonPay as Schema.Schema<Models.PaymentMethodAmazonPay, any, any>
    )
  ),
  au_becs_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodAuBecsDebit, any, any> =>
        Models.PaymentMethodAuBecsDebit as Schema.Schema<Models.PaymentMethodAuBecsDebit, any, any>
    )
  ),
  bacs_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodBacsDebit, any, any> =>
        Models.PaymentMethodBacsDebit as Schema.Schema<Models.PaymentMethodBacsDebit, any, any>
    )
  ),
  bancontact: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodBancontact, any, any> =>
        Models.PaymentMethodBancontact as Schema.Schema<Models.PaymentMethodBancontact, any, any>
    )
  ),
  billie: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodBillie, any, any> =>
        Models.PaymentMethodBillie as Schema.Schema<Models.PaymentMethodBillie, any, any>
    )
  ),
  billing_details: Schema.suspend(
    (): Schema.Schema<Models.BillingDetails, any, any> =>
      Models.BillingDetails as Schema.Schema<Models.BillingDetails, any, any>
  ),
  blik: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodBlik, any, any> =>
        Models.PaymentMethodBlik as Schema.Schema<Models.PaymentMethodBlik, any, any>
    )
  ),
  boleto: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodBoleto, any, any> =>
        Models.PaymentMethodBoleto as Schema.Schema<Models.PaymentMethodBoleto, any, any>
    )
  ),
  card: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodCard, any, any> =>
        Models.PaymentMethodCard as Schema.Schema<Models.PaymentMethodCard, any, any>
    )
  ),
  card_present: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodCardPresent, any, any> =>
        Models.PaymentMethodCardPresent as Schema.Schema<Models.PaymentMethodCardPresent, any, any>
    )
  ),
  cashapp: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodCashapp, any, any> =>
        Models.PaymentMethodCashapp as Schema.Schema<Models.PaymentMethodCashapp, any, any>
    )
  ),
  created: Schema.Number,
  crypto: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodCrypto, any, any> =>
        Models.PaymentMethodCrypto as Schema.Schema<Models.PaymentMethodCrypto, any, any>
    )
  ),
  custom: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodCustom, any, any> =>
        Models.PaymentMethodCustom as Schema.Schema<Models.PaymentMethodCustom, any, any>
    )
  ),
  customer: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Customer, any, any> => Models.Customer as Schema.Schema<Models.Customer, any, any>
      )
    )
  ),
  customer_account: Schema.NullOr(Schema.String),
  customer_balance: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodCustomerBalance, any, any> =>
        Models.PaymentMethodCustomerBalance as Schema.Schema<Models.PaymentMethodCustomerBalance, any, any>
    )
  ),
  eps: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodEps, any, any> =>
        Models.PaymentMethodEps as Schema.Schema<Models.PaymentMethodEps, any, any>
    )
  ),
  fpx: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodFpx, any, any> =>
        Models.PaymentMethodFpx as Schema.Schema<Models.PaymentMethodFpx, any, any>
    )
  ),
  giropay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodGiropay, any, any> =>
        Models.PaymentMethodGiropay as Schema.Schema<Models.PaymentMethodGiropay, any, any>
    )
  ),
  grabpay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodGrabpay, any, any> =>
        Models.PaymentMethodGrabpay as Schema.Schema<Models.PaymentMethodGrabpay, any, any>
    )
  ),
  id: Schema.String,
  ideal: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodIdeal, any, any> =>
        Models.PaymentMethodIdeal as Schema.Schema<Models.PaymentMethodIdeal, any, any>
    )
  ),
  interac_present: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodInteracPresent, any, any> =>
        Models.PaymentMethodInteracPresent as Schema.Schema<Models.PaymentMethodInteracPresent, any, any>
    )
  ),
  kakao_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodKakaoPay, any, any> =>
        Models.PaymentMethodKakaoPay as Schema.Schema<Models.PaymentMethodKakaoPay, any, any>
    )
  ),
  klarna: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodKlarna, any, any> =>
        Models.PaymentMethodKlarna as Schema.Schema<Models.PaymentMethodKlarna, any, any>
    )
  ),
  konbini: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodKonbini, any, any> =>
        Models.PaymentMethodKonbini as Schema.Schema<Models.PaymentMethodKonbini, any, any>
    )
  ),
  kr_card: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodKrCard, any, any> =>
        Models.PaymentMethodKrCard as Schema.Schema<Models.PaymentMethodKrCard, any, any>
    )
  ),
  link: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodLink, any, any> =>
        Models.PaymentMethodLink as Schema.Schema<Models.PaymentMethodLink, any, any>
    )
  ),
  livemode: Schema.Boolean,
  mb_way: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodMbWay, any, any> =>
        Models.PaymentMethodMbWay as Schema.Schema<Models.PaymentMethodMbWay, any, any>
    )
  ),
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  mobilepay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodMobilepay, any, any> =>
        Models.PaymentMethodMobilepay as Schema.Schema<Models.PaymentMethodMobilepay, any, any>
    )
  ),
  multibanco: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodMultibanco, any, any> =>
        Models.PaymentMethodMultibanco as Schema.Schema<Models.PaymentMethodMultibanco, any, any>
    )
  ),
  naver_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodNaverPay, any, any> =>
        Models.PaymentMethodNaverPay as Schema.Schema<Models.PaymentMethodNaverPay, any, any>
    )
  ),
  nz_bank_account: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodNzBankAccount, any, any> =>
        Models.PaymentMethodNzBankAccount as Schema.Schema<Models.PaymentMethodNzBankAccount, any, any>
    )
  ),
  object: Schema.Literal("payment_method"),
  oxxo: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodOxxo, any, any> =>
        Models.PaymentMethodOxxo as Schema.Schema<Models.PaymentMethodOxxo, any, any>
    )
  ),
  p24: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodP24, any, any> =>
        Models.PaymentMethodP24 as Schema.Schema<Models.PaymentMethodP24, any, any>
    )
  ),
  pay_by_bank: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodPayByBank, any, any> =>
        Models.PaymentMethodPayByBank as Schema.Schema<Models.PaymentMethodPayByBank, any, any>
    )
  ),
  payco: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodPayco, any, any> =>
        Models.PaymentMethodPayco as Schema.Schema<Models.PaymentMethodPayco, any, any>
    )
  ),
  paynow: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodPaynow, any, any> =>
        Models.PaymentMethodPaynow as Schema.Schema<Models.PaymentMethodPaynow, any, any>
    )
  ),
  paypal: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodPaypal, any, any> =>
        Models.PaymentMethodPaypal as Schema.Schema<Models.PaymentMethodPaypal, any, any>
    )
  ),
  payto: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodPayto, any, any> =>
        Models.PaymentMethodPayto as Schema.Schema<Models.PaymentMethodPayto, any, any>
    )
  ),
  pix: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodPix, any, any> =>
        Models.PaymentMethodPix as Schema.Schema<Models.PaymentMethodPix, any, any>
    )
  ),
  promptpay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodPromptpay, any, any> =>
        Models.PaymentMethodPromptpay as Schema.Schema<Models.PaymentMethodPromptpay, any, any>
    )
  ),
  radar_options: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.RadarRadarOptions, any, any> =>
        Models.RadarRadarOptions as Schema.Schema<Models.RadarRadarOptions, any, any>
    )
  ),
  revolut_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodRevolutPay, any, any> =>
        Models.PaymentMethodRevolutPay as Schema.Schema<Models.PaymentMethodRevolutPay, any, any>
    )
  ),
  samsung_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodSamsungPay, any, any> =>
        Models.PaymentMethodSamsungPay as Schema.Schema<Models.PaymentMethodSamsungPay, any, any>
    )
  ),
  satispay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodSatispay, any, any> =>
        Models.PaymentMethodSatispay as Schema.Schema<Models.PaymentMethodSatispay, any, any>
    )
  ),
  sepa_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodSepaDebit, any, any> =>
        Models.PaymentMethodSepaDebit as Schema.Schema<Models.PaymentMethodSepaDebit, any, any>
    )
  ),
  sofort: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodSofort, any, any> =>
        Models.PaymentMethodSofort as Schema.Schema<Models.PaymentMethodSofort, any, any>
    )
  ),
  sunbit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodSunbit, any, any> =>
        Models.PaymentMethodSunbit as Schema.Schema<Models.PaymentMethodSunbit, any, any>
    )
  ),
  swish: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodSwish, any, any> =>
        Models.PaymentMethodSwish as Schema.Schema<Models.PaymentMethodSwish, any, any>
    )
  ),
  twint: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodTwint, any, any> =>
        Models.PaymentMethodTwint as Schema.Schema<Models.PaymentMethodTwint, any, any>
    )
  ),
  type: Schema.Literal(
    "acss_debit",
    "affirm",
    "afterpay_clearpay",
    "alipay",
    "alma",
    "amazon_pay",
    "au_becs_debit",
    "bacs_debit",
    "bancontact",
    "billie",
    "blik",
    "boleto",
    "card",
    "card_present",
    "cashapp",
    "crypto",
    "custom",
    "customer_balance",
    "eps",
    "fpx",
    "giropay",
    "grabpay",
    "ideal",
    "interac_present",
    "kakao_pay",
    "klarna",
    "konbini",
    "kr_card",
    "link",
    "mb_way",
    "mobilepay",
    "multibanco",
    "naver_pay",
    "nz_bank_account",
    "oxxo",
    "p24",
    "pay_by_bank",
    "payco",
    "paynow",
    "paypal",
    "payto",
    "pix",
    "promptpay",
    "revolut_pay",
    "samsung_pay",
    "satispay",
    "sepa_debit",
    "sofort",
    "sunbit",
    "swish",
    "twint",
    "upi",
    "us_bank_account",
    "wechat_pay",
    "zip"
  ),
  upi: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodUpi, any, any> =>
        Models.PaymentMethodUpi as Schema.Schema<Models.PaymentMethodUpi, any, any>
    )
  ),
  us_bank_account: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodUsBankAccount, any, any> =>
        Models.PaymentMethodUsBankAccount as Schema.Schema<Models.PaymentMethodUsBankAccount, any, any>
    )
  ),
  wechat_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodWechatPay, any, any> =>
        Models.PaymentMethodWechatPay as Schema.Schema<Models.PaymentMethodWechatPay, any, any>
    )
  ),
  zip: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodZip, any, any> =>
        Models.PaymentMethodZip as Schema.Schema<Models.PaymentMethodZip, any, any>
    )
  )
})
