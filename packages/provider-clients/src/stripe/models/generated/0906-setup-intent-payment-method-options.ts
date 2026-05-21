import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SetupIntentPaymentMethodOptions = Schema.Struct({
  acss_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupIntentPaymentMethodOptionsAcssDebit, any, any> =>
        Models.SetupIntentPaymentMethodOptionsAcssDebit as Schema.Schema<
          Models.SetupIntentPaymentMethodOptionsAcssDebit,
          any,
          any
        >
    )
  ),
  amazon_pay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupIntentPaymentMethodOptionsAmazonPay, any, any> =>
        Models.SetupIntentPaymentMethodOptionsAmazonPay as Schema.Schema<
          Models.SetupIntentPaymentMethodOptionsAmazonPay,
          any,
          any
        >
    )
  ),
  bacs_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupIntentPaymentMethodOptionsBacsDebit, any, any> =>
        Models.SetupIntentPaymentMethodOptionsBacsDebit as Schema.Schema<
          Models.SetupIntentPaymentMethodOptionsBacsDebit,
          any,
          any
        >
    )
  ),
  card: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupIntentPaymentMethodOptionsCard, any, any> =>
        Models.SetupIntentPaymentMethodOptionsCard as Schema.Schema<
          Models.SetupIntentPaymentMethodOptionsCard,
          any,
          any
        >
    )
  ),
  card_present: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupIntentPaymentMethodOptionsCardPresent, any, any> =>
        Models.SetupIntentPaymentMethodOptionsCardPresent as Schema.Schema<
          Models.SetupIntentPaymentMethodOptionsCardPresent,
          any,
          any
        >
    )
  ),
  klarna: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupIntentPaymentMethodOptionsKlarna, any, any> =>
        Models.SetupIntentPaymentMethodOptionsKlarna as Schema.Schema<
          Models.SetupIntentPaymentMethodOptionsKlarna,
          any,
          any
        >
    )
  ),
  link: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupIntentPaymentMethodOptionsLink, any, any> =>
        Models.SetupIntentPaymentMethodOptionsLink as Schema.Schema<
          Models.SetupIntentPaymentMethodOptionsLink,
          any,
          any
        >
    )
  ),
  paypal: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupIntentPaymentMethodOptionsPaypal, any, any> =>
        Models.SetupIntentPaymentMethodOptionsPaypal as Schema.Schema<
          Models.SetupIntentPaymentMethodOptionsPaypal,
          any,
          any
        >
    )
  ),
  payto: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupIntentPaymentMethodOptionsPayto, any, any> =>
        Models.SetupIntentPaymentMethodOptionsPayto as Schema.Schema<
          Models.SetupIntentPaymentMethodOptionsPayto,
          any,
          any
        >
    )
  ),
  pix: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupIntentPaymentMethodOptionsPix, any, any> =>
        Models.SetupIntentPaymentMethodOptionsPix as Schema.Schema<Models.SetupIntentPaymentMethodOptionsPix, any, any>
    )
  ),
  sepa_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupIntentPaymentMethodOptionsSepaDebit, any, any> =>
        Models.SetupIntentPaymentMethodOptionsSepaDebit as Schema.Schema<
          Models.SetupIntentPaymentMethodOptionsSepaDebit,
          any,
          any
        >
    )
  ),
  upi: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupIntentPaymentMethodOptionsUpi, any, any> =>
        Models.SetupIntentPaymentMethodOptionsUpi as Schema.Schema<Models.SetupIntentPaymentMethodOptionsUpi, any, any>
    )
  ),
  us_bank_account: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupIntentPaymentMethodOptionsUsBankAccount, any, any> =>
        Models.SetupIntentPaymentMethodOptionsUsBankAccount as Schema.Schema<
          Models.SetupIntentPaymentMethodOptionsUsBankAccount,
          any,
          any
        >
    )
  )
})
export type SetupIntentPaymentMethodOptions = typeof SetupIntentPaymentMethodOptions.Type
