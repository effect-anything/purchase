import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentsPrimitivesPaymentRecordsResourcePaymentMethodDetails = Schema.Struct({
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
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordAcssDebit, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordAcssDebit as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordAcssDebit,
          any,
          any
        >
    )
  ),
  affirm: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordAffirm, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordAffirm as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordAffirm,
          any,
          any
        >
    )
  ),
  afterpay_clearpay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordAfterpayClearpay, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordAfterpayClearpay as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordAfterpayClearpay,
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
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordAlma, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordAlma as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordAlma,
          any,
          any
        >
    )
  ),
  amazon_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordAmazonPay, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordAmazonPay as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordAmazonPay,
          any,
          any
        >
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
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordBancontact, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordBancontact as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordBancontact,
          any,
          any
        >
    )
  ),
  billie: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordBillie, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordBillie as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordBillie,
          any,
          any
        >
    )
  ),
  billing_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentsPrimitivesPaymentRecordsResourceBillingDetails, any, any> =>
        Models.PaymentsPrimitivesPaymentRecordsResourceBillingDetails as Schema.Schema<
          Models.PaymentsPrimitivesPaymentRecordsResourceBillingDetails,
          any,
          any
        >
    )
  ),
  blik: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordBlik, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordBlik as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordBlik,
          any,
          any
        >
    )
  ),
  boleto: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordBoleto, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordBoleto as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordBoleto,
          any,
          any
        >
    )
  ),
  card: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetails, any, any> =>
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetails as Schema.Schema<
          Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetails,
          any,
          any
        >
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
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordCashapp, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordCashapp as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordCashapp,
          any,
          any
        >
    )
  ),
  crypto: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsCrypto, any, any> =>
        Models.PaymentMethodDetailsCrypto as Schema.Schema<Models.PaymentMethodDetailsCrypto, any, any>
    )
  ),
  custom: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCustomDetails, any, any> =>
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCustomDetails as Schema.Schema<
          Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCustomDetails,
          any,
          any
        >
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
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordEps, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordEps as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordEps,
          any,
          any
        >
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
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordGiropay, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordGiropay as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordGiropay,
          any,
          any
        >
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
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordIdeal, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordIdeal as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordIdeal,
          any,
          any
        >
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
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordKakaoPay, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordKakaoPay as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordKakaoPay,
          any,
          any
        >
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
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordKonbini, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordKonbini as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordKonbini,
          any,
          any
        >
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
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordMbWay, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordMbWay as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordMbWay,
          any,
          any
        >
    )
  ),
  mobilepay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordMobilepay, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordMobilepay as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordMobilepay,
          any,
          any
        >
    )
  ),
  multibanco: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordMultibanco, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordMultibanco as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordMultibanco,
          any,
          any
        >
    )
  ),
  naver_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordNaverPay, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordNaverPay as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordNaverPay,
          any,
          any
        >
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
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordOxxo, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordOxxo as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordOxxo,
          any,
          any
        >
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
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordPayByBank, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordPayByBank as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordPayByBank,
          any,
          any
        >
    )
  ),
  payco: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordPayco, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordPayco as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordPayco,
          any,
          any
        >
    )
  ),
  payment_method: Schema.NullOr(Schema.String),
  paynow: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordPaynow, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordPaynow as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordPaynow,
          any,
          any
        >
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
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordPix, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordPix as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordPix,
          any,
          any
        >
    )
  ),
  promptpay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordPromptpay, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordPromptpay as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordPromptpay,
          any,
          any
        >
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
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordSamsungPay, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordSamsungPay as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordSamsungPay,
          any,
          any
        >
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
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordSepaDebit, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordSepaDebit as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordSepaDebit,
          any,
          any
        >
    )
  ),
  sofort: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordSofort, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordSofort as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordSofort,
          any,
          any
        >
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
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordSwish, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordSwish as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordSwish,
          any,
          any
        >
    )
  ),
  twint: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordTwint, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordTwint as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordTwint,
          any,
          any
        >
    )
  ),
  type: Schema.String,
  upi: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordUpi, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordUpi as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordUpi,
          any,
          any
        >
    )
  ),
  us_bank_account: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordUsBankAccount, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordUsBankAccount as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordUsBankAccount,
          any,
          any
        >
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
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordWechatPay, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordWechatPay as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordWechatPay,
          any,
          any
        >
    )
  ),
  zip: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsPaymentRecordZip, any, any> =>
        Models.PaymentMethodDetailsPaymentRecordZip as Schema.Schema<
          Models.PaymentMethodDetailsPaymentRecordZip,
          any,
          any
        >
    )
  )
})
export type PaymentsPrimitivesPaymentRecordsResourcePaymentMethodDetails =
  typeof PaymentsPrimitivesPaymentRecordsResourcePaymentMethodDetails.Type
