import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionsResourcePaymentMethodOptions = Schema.Struct({
  acss_debit: Schema.NullOr(Schema.suspend((): typeof Models.InvoicePaymentMethodOptionsAcssDebit => Models.InvoicePaymentMethodOptionsAcssDebit)),
  bancontact: Schema.NullOr(Schema.suspend((): typeof Models.InvoicePaymentMethodOptionsBancontact => Models.InvoicePaymentMethodOptionsBancontact)),
  card: Schema.NullOr(Schema.suspend((): typeof Models.SubscriptionPaymentMethodOptionsCard => Models.SubscriptionPaymentMethodOptionsCard)),
  customer_balance: Schema.NullOr(Schema.suspend((): typeof Models.InvoicePaymentMethodOptionsCustomerBalance => Models.InvoicePaymentMethodOptionsCustomerBalance)),
  konbini: Schema.NullOr(Schema.suspend((): typeof Models.InvoicePaymentMethodOptionsKonbini => Models.InvoicePaymentMethodOptionsKonbini)),
  payto: Schema.NullOr(Schema.suspend((): typeof Models.InvoicePaymentMethodOptionsPayto => Models.InvoicePaymentMethodOptionsPayto)),
  pix: Schema.NullOr(Schema.suspend((): typeof Models.SubscriptionPaymentMethodOptionsPix => Models.SubscriptionPaymentMethodOptionsPix)),
  sepa_debit: Schema.NullOr(Schema.suspend((): typeof Models.InvoicePaymentMethodOptionsSepaDebit => Models.InvoicePaymentMethodOptionsSepaDebit)),
  upi: Schema.NullOr(Schema.suspend((): typeof Models.InvoicePaymentMethodOptionsUpi => Models.InvoicePaymentMethodOptionsUpi)),
  us_bank_account: Schema.NullOr(Schema.suspend((): typeof Models.InvoicePaymentMethodOptionsUsBankAccount => Models.InvoicePaymentMethodOptionsUsBankAccount)),
})
export type SubscriptionsResourcePaymentMethodOptions = typeof SubscriptionsResourcePaymentMethodOptions.Type
