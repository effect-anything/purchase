import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AccountSettings = Schema.Struct({
  bacs_debit_payments: Schema.optional(Schema.suspend((): typeof Models.AccountBacsDebitPaymentsSettings => Models.AccountBacsDebitPaymentsSettings)),
  branding: Schema.suspend((): typeof Models.AccountBrandingSettings => Models.AccountBrandingSettings),
  card_issuing: Schema.optional(Schema.suspend((): typeof Models.AccountCardIssuingSettings => Models.AccountCardIssuingSettings)),
  card_payments: Schema.suspend((): typeof Models.AccountCardPaymentsSettings => Models.AccountCardPaymentsSettings),
  dashboard: Schema.suspend((): typeof Models.AccountDashboardSettings => Models.AccountDashboardSettings),
  invoices: Schema.optional(Schema.suspend((): typeof Models.AccountInvoicesSettings => Models.AccountInvoicesSettings)),
  payments: Schema.suspend((): typeof Models.AccountPaymentsSettings => Models.AccountPaymentsSettings),
  payouts: Schema.optional(Schema.suspend((): typeof Models.AccountPayoutSettings => Models.AccountPayoutSettings)),
  sepa_debit_payments: Schema.optional(Schema.suspend((): typeof Models.AccountSepaDebitPaymentsSettings => Models.AccountSepaDebitPaymentsSettings)),
  treasury: Schema.optional(Schema.suspend((): typeof Models.AccountTreasurySettings => Models.AccountTreasurySettings)),
})
export type AccountSettings = typeof AccountSettings.Type
