import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const MandatePaymentMethodDetails = Schema.Struct({
  acss_debit: Schema.optional(Schema.suspend((): typeof Models.MandateAcssDebit => Models.MandateAcssDebit)),
  amazon_pay: Schema.optional(Schema.suspend((): typeof Models.MandateAmazonPay => Models.MandateAmazonPay)),
  au_becs_debit: Schema.optional(Schema.suspend((): typeof Models.MandateAuBecsDebit => Models.MandateAuBecsDebit)),
  bacs_debit: Schema.optional(Schema.suspend((): typeof Models.MandateBacsDebit => Models.MandateBacsDebit)),
  card: Schema.optional(Schema.suspend((): typeof Models.CardMandatePaymentMethodDetails => Models.CardMandatePaymentMethodDetails)),
  cashapp: Schema.optional(Schema.suspend((): typeof Models.MandateCashapp => Models.MandateCashapp)),
  kakao_pay: Schema.optional(Schema.suspend((): typeof Models.MandateKakaoPay => Models.MandateKakaoPay)),
  klarna: Schema.optional(Schema.suspend((): typeof Models.MandateKlarna => Models.MandateKlarna)),
  kr_card: Schema.optional(Schema.suspend((): typeof Models.MandateKrCard => Models.MandateKrCard)),
  link: Schema.optional(Schema.suspend((): typeof Models.MandateLink => Models.MandateLink)),
  naver_pay: Schema.optional(Schema.suspend((): typeof Models.MandateNaverPay => Models.MandateNaverPay)),
  nz_bank_account: Schema.optional(Schema.suspend((): typeof Models.MandateNzBankAccount => Models.MandateNzBankAccount)),
  paypal: Schema.optional(Schema.suspend((): typeof Models.MandatePaypal => Models.MandatePaypal)),
  payto: Schema.optional(Schema.suspend((): typeof Models.MandatePayto => Models.MandatePayto)),
  pix: Schema.optional(Schema.suspend((): typeof Models.MandatePix => Models.MandatePix)),
  revolut_pay: Schema.optional(Schema.suspend((): typeof Models.MandateRevolutPay => Models.MandateRevolutPay)),
  sepa_debit: Schema.optional(Schema.suspend((): typeof Models.MandateSepaDebit => Models.MandateSepaDebit)),
  type: Schema.String,
  upi: Schema.optional(Schema.suspend((): typeof Models.MandateUpi => Models.MandateUpi)),
  us_bank_account: Schema.optional(Schema.suspend((): typeof Models.MandateUsBankAccount => Models.MandateUsBankAccount)),
})
export type MandatePaymentMethodDetails = typeof MandatePaymentMethodDetails.Type
