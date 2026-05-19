import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SetupIntentPaymentMethodOptions = Schema.Struct({
  acss_debit: Schema.optional(Schema.suspend((): typeof Models.SetupIntentPaymentMethodOptionsAcssDebit => Models.SetupIntentPaymentMethodOptionsAcssDebit)),
  amazon_pay: Schema.optional(Schema.suspend((): typeof Models.SetupIntentPaymentMethodOptionsAmazonPay => Models.SetupIntentPaymentMethodOptionsAmazonPay)),
  bacs_debit: Schema.optional(Schema.suspend((): typeof Models.SetupIntentPaymentMethodOptionsBacsDebit => Models.SetupIntentPaymentMethodOptionsBacsDebit)),
  card: Schema.optional(Schema.suspend((): typeof Models.SetupIntentPaymentMethodOptionsCard => Models.SetupIntentPaymentMethodOptionsCard)),
  card_present: Schema.optional(Schema.suspend((): typeof Models.SetupIntentPaymentMethodOptionsCardPresent => Models.SetupIntentPaymentMethodOptionsCardPresent)),
  klarna: Schema.optional(Schema.suspend((): typeof Models.SetupIntentPaymentMethodOptionsKlarna => Models.SetupIntentPaymentMethodOptionsKlarna)),
  link: Schema.optional(Schema.suspend((): typeof Models.SetupIntentPaymentMethodOptionsLink => Models.SetupIntentPaymentMethodOptionsLink)),
  paypal: Schema.optional(Schema.suspend((): typeof Models.SetupIntentPaymentMethodOptionsPaypal => Models.SetupIntentPaymentMethodOptionsPaypal)),
  payto: Schema.optional(Schema.suspend((): typeof Models.SetupIntentPaymentMethodOptionsPayto => Models.SetupIntentPaymentMethodOptionsPayto)),
  pix: Schema.optional(Schema.suspend((): typeof Models.SetupIntentPaymentMethodOptionsPix => Models.SetupIntentPaymentMethodOptionsPix)),
  sepa_debit: Schema.optional(Schema.suspend((): typeof Models.SetupIntentPaymentMethodOptionsSepaDebit => Models.SetupIntentPaymentMethodOptionsSepaDebit)),
  upi: Schema.optional(Schema.suspend((): typeof Models.SetupIntentPaymentMethodOptionsUpi => Models.SetupIntentPaymentMethodOptionsUpi)),
  us_bank_account: Schema.optional(Schema.suspend((): typeof Models.SetupIntentPaymentMethodOptionsUsBankAccount => Models.SetupIntentPaymentMethodOptionsUsBankAccount)),
})
export type SetupIntentPaymentMethodOptions = typeof SetupIntentPaymentMethodOptions.Type
