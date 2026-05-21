import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const InvoicesPaymentMethodOptions = Schema.Struct({
  acss_debit: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.InvoicePaymentMethodOptionsAcssDebit, any, any> =>
        Models.InvoicePaymentMethodOptionsAcssDebit as Schema.Schema<
          Models.InvoicePaymentMethodOptionsAcssDebit,
          any,
          any
        >
    )
  ),
  bancontact: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.InvoicePaymentMethodOptionsBancontact, any, any> =>
        Models.InvoicePaymentMethodOptionsBancontact as Schema.Schema<
          Models.InvoicePaymentMethodOptionsBancontact,
          any,
          any
        >
    )
  ),
  card: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.InvoicePaymentMethodOptionsCard, any, any> =>
        Models.InvoicePaymentMethodOptionsCard as Schema.Schema<Models.InvoicePaymentMethodOptionsCard, any, any>
    )
  ),
  customer_balance: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.InvoicePaymentMethodOptionsCustomerBalance, any, any> =>
        Models.InvoicePaymentMethodOptionsCustomerBalance as Schema.Schema<
          Models.InvoicePaymentMethodOptionsCustomerBalance,
          any,
          any
        >
    )
  ),
  konbini: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.InvoicePaymentMethodOptionsKonbini, any, any> =>
        Models.InvoicePaymentMethodOptionsKonbini as Schema.Schema<Models.InvoicePaymentMethodOptionsKonbini, any, any>
    )
  ),
  payto: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.InvoicePaymentMethodOptionsPayto, any, any> =>
        Models.InvoicePaymentMethodOptionsPayto as Schema.Schema<Models.InvoicePaymentMethodOptionsPayto, any, any>
    )
  ),
  pix: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.InvoicePaymentMethodOptionsPix, any, any> =>
        Models.InvoicePaymentMethodOptionsPix as Schema.Schema<Models.InvoicePaymentMethodOptionsPix, any, any>
    )
  ),
  sepa_debit: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.InvoicePaymentMethodOptionsSepaDebit, any, any> =>
        Models.InvoicePaymentMethodOptionsSepaDebit as Schema.Schema<
          Models.InvoicePaymentMethodOptionsSepaDebit,
          any,
          any
        >
    )
  ),
  upi: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.InvoicePaymentMethodOptionsUpi, any, any> =>
        Models.InvoicePaymentMethodOptionsUpi as Schema.Schema<Models.InvoicePaymentMethodOptionsUpi, any, any>
    )
  ),
  us_bank_account: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.InvoicePaymentMethodOptionsUsBankAccount, any, any> =>
        Models.InvoicePaymentMethodOptionsUsBankAccount as Schema.Schema<
          Models.InvoicePaymentMethodOptionsUsBankAccount,
          any,
          any
        >
    )
  )
})
export type InvoicesPaymentMethodOptions = typeof InvoicesPaymentMethodOptions.Type
