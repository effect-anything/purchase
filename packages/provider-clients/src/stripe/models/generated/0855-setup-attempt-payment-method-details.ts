import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SetupAttemptPaymentMethodDetails = Schema.Struct({
  acss_debit: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsAcssDebit => Models.SetupAttemptPaymentMethodDetailsAcssDebit)),
  amazon_pay: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsAmazonPay => Models.SetupAttemptPaymentMethodDetailsAmazonPay)),
  au_becs_debit: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsAuBecsDebit => Models.SetupAttemptPaymentMethodDetailsAuBecsDebit)),
  bacs_debit: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsBacsDebit => Models.SetupAttemptPaymentMethodDetailsBacsDebit)),
  bancontact: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsBancontact => Models.SetupAttemptPaymentMethodDetailsBancontact)),
  boleto: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsBoleto => Models.SetupAttemptPaymentMethodDetailsBoleto)),
  card: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsCard => Models.SetupAttemptPaymentMethodDetailsCard)),
  card_present: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsCardPresent => Models.SetupAttemptPaymentMethodDetailsCardPresent)),
  cashapp: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsCashapp => Models.SetupAttemptPaymentMethodDetailsCashapp)),
  ideal: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsIdeal => Models.SetupAttemptPaymentMethodDetailsIdeal)),
  kakao_pay: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsKakaoPay => Models.SetupAttemptPaymentMethodDetailsKakaoPay)),
  klarna: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsKlarna => Models.SetupAttemptPaymentMethodDetailsKlarna)),
  kr_card: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsKrCard => Models.SetupAttemptPaymentMethodDetailsKrCard)),
  link: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsLink => Models.SetupAttemptPaymentMethodDetailsLink)),
  naver_pay: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsNaverPay => Models.SetupAttemptPaymentMethodDetailsNaverPay)),
  nz_bank_account: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsNzBankAccount => Models.SetupAttemptPaymentMethodDetailsNzBankAccount)),
  paypal: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsPaypal => Models.SetupAttemptPaymentMethodDetailsPaypal)),
  payto: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsPayto => Models.SetupAttemptPaymentMethodDetailsPayto)),
  pix: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsPix => Models.SetupAttemptPaymentMethodDetailsPix)),
  revolut_pay: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsRevolutPay => Models.SetupAttemptPaymentMethodDetailsRevolutPay)),
  sepa_debit: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsSepaDebit => Models.SetupAttemptPaymentMethodDetailsSepaDebit)),
  sofort: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsSofort => Models.SetupAttemptPaymentMethodDetailsSofort)),
  type: Schema.String,
  upi: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsUpi => Models.SetupAttemptPaymentMethodDetailsUpi)),
  us_bank_account: Schema.optional(Schema.suspend((): typeof Models.SetupAttemptPaymentMethodDetailsUsBankAccount => Models.SetupAttemptPaymentMethodDetailsUsBankAccount)),
})
export type SetupAttemptPaymentMethodDetails = typeof SetupAttemptPaymentMethodDetails.Type
