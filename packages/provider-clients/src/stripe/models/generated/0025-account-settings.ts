import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const AccountSettings = Schema.Struct({
  bacs_debit_payments: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.AccountBacsDebitPaymentsSettings, any, any> =>
        Models.AccountBacsDebitPaymentsSettings as Schema.Schema<Models.AccountBacsDebitPaymentsSettings, any, any>
    )
  ),
  branding: Schema.suspend(
    (): Schema.Schema<Models.AccountBrandingSettings, any, any> =>
      Models.AccountBrandingSettings as Schema.Schema<Models.AccountBrandingSettings, any, any>
  ),
  card_issuing: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.AccountCardIssuingSettings, any, any> =>
        Models.AccountCardIssuingSettings as Schema.Schema<Models.AccountCardIssuingSettings, any, any>
    )
  ),
  card_payments: Schema.suspend(
    (): Schema.Schema<Models.AccountCardPaymentsSettings, any, any> =>
      Models.AccountCardPaymentsSettings as Schema.Schema<Models.AccountCardPaymentsSettings, any, any>
  ),
  dashboard: Schema.suspend(
    (): Schema.Schema<Models.AccountDashboardSettings, any, any> =>
      Models.AccountDashboardSettings as Schema.Schema<Models.AccountDashboardSettings, any, any>
  ),
  invoices: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.AccountInvoicesSettings, any, any> =>
        Models.AccountInvoicesSettings as Schema.Schema<Models.AccountInvoicesSettings, any, any>
    )
  ),
  payments: Schema.suspend(
    (): Schema.Schema<Models.AccountPaymentsSettings, any, any> =>
      Models.AccountPaymentsSettings as Schema.Schema<Models.AccountPaymentsSettings, any, any>
  ),
  payouts: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.AccountPayoutSettings, any, any> =>
        Models.AccountPayoutSettings as Schema.Schema<Models.AccountPayoutSettings, any, any>
    )
  ),
  sepa_debit_payments: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.AccountSepaDebitPaymentsSettings, any, any> =>
        Models.AccountSepaDebitPaymentsSettings as Schema.Schema<Models.AccountSepaDebitPaymentsSettings, any, any>
    )
  ),
  treasury: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.AccountTreasurySettings, any, any> =>
        Models.AccountTreasurySettings as Schema.Schema<Models.AccountTreasurySettings, any, any>
    )
  )
})
export type AccountSettings = typeof AccountSettings.Type
