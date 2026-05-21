import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentLinksResourceSubscriptionData = Schema.Struct({
  description: Schema.NullOr(Schema.String),
  invoice_settings: Schema.suspend(
    (): Schema.Schema<Models.PaymentLinksResourceSubscriptionDataInvoiceSettings, any, any> =>
      Models.PaymentLinksResourceSubscriptionDataInvoiceSettings as Schema.Schema<
        Models.PaymentLinksResourceSubscriptionDataInvoiceSettings,
        any,
        any
      >
  ),
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  trial_period_days: Schema.NullOr(Schema.Number),
  trial_settings: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionsTrialsResourceTrialSettings, any, any> =>
        Models.SubscriptionsTrialsResourceTrialSettings as Schema.Schema<
          Models.SubscriptionsTrialsResourceTrialSettings,
          any,
          any
        >
    )
  )
})
export type PaymentLinksResourceSubscriptionData = typeof PaymentLinksResourceSubscriptionData.Type
