import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentLinksResourceSubscriptionData = Schema.Struct({
  description: Schema.NullOr(Schema.String),
  invoice_settings: Schema.suspend((): typeof Models.PaymentLinksResourceSubscriptionDataInvoiceSettings => Models.PaymentLinksResourceSubscriptionDataInvoiceSettings),
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  trial_period_days: Schema.NullOr(Schema.Number),
  trial_settings: Schema.NullOr(Schema.suspend((): typeof Models.SubscriptionsTrialsResourceTrialSettings => Models.SubscriptionsTrialsResourceTrialSettings)),
})
export type PaymentLinksResourceSubscriptionData = typeof PaymentLinksResourceSubscriptionData.Type
