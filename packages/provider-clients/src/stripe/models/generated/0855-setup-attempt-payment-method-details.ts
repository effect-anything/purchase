import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type SetupAttemptPaymentMethodDetails = {
  readonly acss_debit?: Models.SetupAttemptPaymentMethodDetailsAcssDebit
  readonly amazon_pay?: Models.SetupAttemptPaymentMethodDetailsAmazonPay
  readonly au_becs_debit?: Models.SetupAttemptPaymentMethodDetailsAuBecsDebit
  readonly bacs_debit?: Models.SetupAttemptPaymentMethodDetailsBacsDebit
  readonly bancontact?: Models.SetupAttemptPaymentMethodDetailsBancontact
  readonly boleto?: Models.SetupAttemptPaymentMethodDetailsBoleto
  readonly card?: Models.SetupAttemptPaymentMethodDetailsCard
  readonly card_present?: Models.SetupAttemptPaymentMethodDetailsCardPresent
  readonly cashapp?: Models.SetupAttemptPaymentMethodDetailsCashapp
  readonly ideal?: Models.SetupAttemptPaymentMethodDetailsIdeal
  readonly kakao_pay?: Models.SetupAttemptPaymentMethodDetailsKakaoPay
  readonly klarna?: Models.SetupAttemptPaymentMethodDetailsKlarna
  readonly kr_card?: Models.SetupAttemptPaymentMethodDetailsKrCard
  readonly link?: Models.SetupAttemptPaymentMethodDetailsLink
  readonly naver_pay?: Models.SetupAttemptPaymentMethodDetailsNaverPay
  readonly nz_bank_account?: Models.SetupAttemptPaymentMethodDetailsNzBankAccount
  readonly paypal?: Models.SetupAttemptPaymentMethodDetailsPaypal
  readonly payto?: Models.SetupAttemptPaymentMethodDetailsPayto
  readonly pix?: Models.SetupAttemptPaymentMethodDetailsPix
  readonly revolut_pay?: Models.SetupAttemptPaymentMethodDetailsRevolutPay
  readonly sepa_debit?: Models.SetupAttemptPaymentMethodDetailsSepaDebit
  readonly sofort?: Models.SetupAttemptPaymentMethodDetailsSofort
  readonly type: string
  readonly upi?: Models.SetupAttemptPaymentMethodDetailsUpi
  readonly us_bank_account?: Models.SetupAttemptPaymentMethodDetailsUsBankAccount
}

export const SetupAttemptPaymentMethodDetails = Schema.Struct({
  acss_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsAcssDebit, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsAcssDebit as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsAcssDebit,
          any,
          any
        >
    )
  ),
  amazon_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsAmazonPay, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsAmazonPay as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsAmazonPay,
          any,
          any
        >
    )
  ),
  au_becs_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsAuBecsDebit, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsAuBecsDebit as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsAuBecsDebit,
          any,
          any
        >
    )
  ),
  bacs_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsBacsDebit, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsBacsDebit as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsBacsDebit,
          any,
          any
        >
    )
  ),
  bancontact: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsBancontact, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsBancontact as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsBancontact,
          any,
          any
        >
    )
  ),
  boleto: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsBoleto, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsBoleto as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsBoleto,
          any,
          any
        >
    )
  ),
  card: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsCard, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsCard as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsCard,
          any,
          any
        >
    )
  ),
  card_present: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsCardPresent, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsCardPresent as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsCardPresent,
          any,
          any
        >
    )
  ),
  cashapp: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsCashapp, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsCashapp as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsCashapp,
          any,
          any
        >
    )
  ),
  ideal: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsIdeal, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsIdeal as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsIdeal,
          any,
          any
        >
    )
  ),
  kakao_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsKakaoPay, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsKakaoPay as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsKakaoPay,
          any,
          any
        >
    )
  ),
  klarna: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsKlarna, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsKlarna as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsKlarna,
          any,
          any
        >
    )
  ),
  kr_card: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsKrCard, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsKrCard as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsKrCard,
          any,
          any
        >
    )
  ),
  link: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsLink, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsLink as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsLink,
          any,
          any
        >
    )
  ),
  naver_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsNaverPay, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsNaverPay as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsNaverPay,
          any,
          any
        >
    )
  ),
  nz_bank_account: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsNzBankAccount, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsNzBankAccount as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsNzBankAccount,
          any,
          any
        >
    )
  ),
  paypal: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsPaypal, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsPaypal as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsPaypal,
          any,
          any
        >
    )
  ),
  payto: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsPayto, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsPayto as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsPayto,
          any,
          any
        >
    )
  ),
  pix: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsPix, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsPix as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsPix,
          any,
          any
        >
    )
  ),
  revolut_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsRevolutPay, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsRevolutPay as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsRevolutPay,
          any,
          any
        >
    )
  ),
  sepa_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsSepaDebit, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsSepaDebit as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsSepaDebit,
          any,
          any
        >
    )
  ),
  sofort: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsSofort, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsSofort as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsSofort,
          any,
          any
        >
    )
  ),
  type: Schema.String,
  upi: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsUpi, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsUpi as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsUpi,
          any,
          any
        >
    )
  ),
  us_bank_account: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsUsBankAccount, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsUsBankAccount as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsUsBankAccount,
          any,
          any
        >
    )
  )
})
