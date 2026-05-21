import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const MandatePaymentMethodDetails = Schema.Struct({
  acss_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MandateAcssDebit, any, any> =>
        Models.MandateAcssDebit as Schema.Schema<Models.MandateAcssDebit, any, any>
    )
  ),
  amazon_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MandateAmazonPay, any, any> =>
        Models.MandateAmazonPay as Schema.Schema<Models.MandateAmazonPay, any, any>
    )
  ),
  au_becs_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MandateAuBecsDebit, any, any> =>
        Models.MandateAuBecsDebit as Schema.Schema<Models.MandateAuBecsDebit, any, any>
    )
  ),
  bacs_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MandateBacsDebit, any, any> =>
        Models.MandateBacsDebit as Schema.Schema<Models.MandateBacsDebit, any, any>
    )
  ),
  card: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.CardMandatePaymentMethodDetails, any, any> =>
        Models.CardMandatePaymentMethodDetails as Schema.Schema<Models.CardMandatePaymentMethodDetails, any, any>
    )
  ),
  cashapp: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MandateCashapp, any, any> =>
        Models.MandateCashapp as Schema.Schema<Models.MandateCashapp, any, any>
    )
  ),
  kakao_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MandateKakaoPay, any, any> =>
        Models.MandateKakaoPay as Schema.Schema<Models.MandateKakaoPay, any, any>
    )
  ),
  klarna: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MandateKlarna, any, any> =>
        Models.MandateKlarna as Schema.Schema<Models.MandateKlarna, any, any>
    )
  ),
  kr_card: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MandateKrCard, any, any> =>
        Models.MandateKrCard as Schema.Schema<Models.MandateKrCard, any, any>
    )
  ),
  link: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MandateLink, any, any> =>
        Models.MandateLink as Schema.Schema<Models.MandateLink, any, any>
    )
  ),
  naver_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MandateNaverPay, any, any> =>
        Models.MandateNaverPay as Schema.Schema<Models.MandateNaverPay, any, any>
    )
  ),
  nz_bank_account: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MandateNzBankAccount, any, any> =>
        Models.MandateNzBankAccount as Schema.Schema<Models.MandateNzBankAccount, any, any>
    )
  ),
  paypal: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MandatePaypal, any, any> =>
        Models.MandatePaypal as Schema.Schema<Models.MandatePaypal, any, any>
    )
  ),
  payto: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MandatePayto, any, any> =>
        Models.MandatePayto as Schema.Schema<Models.MandatePayto, any, any>
    )
  ),
  pix: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MandatePix, any, any> => Models.MandatePix as Schema.Schema<Models.MandatePix, any, any>
    )
  ),
  revolut_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MandateRevolutPay, any, any> =>
        Models.MandateRevolutPay as Schema.Schema<Models.MandateRevolutPay, any, any>
    )
  ),
  sepa_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MandateSepaDebit, any, any> =>
        Models.MandateSepaDebit as Schema.Schema<Models.MandateSepaDebit, any, any>
    )
  ),
  type: Schema.String,
  upi: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MandateUpi, any, any> => Models.MandateUpi as Schema.Schema<Models.MandateUpi, any, any>
    )
  ),
  us_bank_account: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MandateUsBankAccount, any, any> =>
        Models.MandateUsBankAccount as Schema.Schema<Models.MandateUsBankAccount, any, any>
    )
  )
})
export type MandatePaymentMethodDetails = typeof MandatePaymentMethodDetails.Type
