import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionSchedulesResourceDefaultSettings = Schema.Struct({
  application_fee_percent: Schema.NullOr(Schema.Number),
  automatic_tax: Schema.optional(Schema.suspend((): typeof Models.SubscriptionSchedulesResourceDefaultSettingsAutomaticTax => Models.SubscriptionSchedulesResourceDefaultSettingsAutomaticTax)),
  billing_cycle_anchor: Schema.Literal("automatic", "phase_start"),
  billing_thresholds: Schema.NullOr(Schema.suspend((): typeof Models.SubscriptionBillingThresholds => Models.SubscriptionBillingThresholds)),
  collection_method: Schema.NullOr(Schema.Literal("charge_automatically", "send_invoice")),
  default_payment_method: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.PaymentMethod => Models.PaymentMethod))),
  description: Schema.NullOr(Schema.String),
  invoice_settings: Schema.suspend((): typeof Models.InvoiceSettingSubscriptionScheduleSetting => Models.InvoiceSettingSubscriptionScheduleSetting),
  on_behalf_of: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Account => Models.Account))),
  transfer_data: Schema.NullOr(Schema.suspend((): typeof Models.SubscriptionTransferData => Models.SubscriptionTransferData)),
})
export type SubscriptionSchedulesResourceDefaultSettings = typeof SubscriptionSchedulesResourceDefaultSettings.Type
