import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionSchedulePhaseConfiguration = Schema.Struct({
  add_invoice_items: Schema.Array(Schema.suspend((): typeof Models.SubscriptionScheduleAddInvoiceItem => Models.SubscriptionScheduleAddInvoiceItem)),
  application_fee_percent: Schema.NullOr(Schema.Number),
  automatic_tax: Schema.optional(Schema.suspend((): typeof Models.SchedulesPhaseAutomaticTax => Models.SchedulesPhaseAutomaticTax)),
  billing_cycle_anchor: Schema.NullOr(Schema.Literal("automatic", "phase_start")),
  billing_thresholds: Schema.NullOr(Schema.suspend((): typeof Models.SubscriptionBillingThresholds => Models.SubscriptionBillingThresholds)),
  collection_method: Schema.NullOr(Schema.Literal("charge_automatically", "send_invoice")),
  currency: Schema.String,
  default_payment_method: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.PaymentMethod => Models.PaymentMethod))),
  default_tax_rates: Schema.optional(Schema.NullOr(Schema.Array(Schema.suspend((): typeof Models.TaxRate => Models.TaxRate)))),
  description: Schema.NullOr(Schema.String),
  discounts: Schema.Array(Schema.suspend((): typeof Models.StackableDiscountWithDiscountSettingsAndDiscountEnd => Models.StackableDiscountWithDiscountSettingsAndDiscountEnd)),
  end_date: Schema.Number,
  invoice_settings: Schema.NullOr(Schema.suspend((): typeof Models.InvoiceSettingSubscriptionSchedulePhaseSetting => Models.InvoiceSettingSubscriptionSchedulePhaseSetting)),
  items: Schema.Array(Schema.suspend((): typeof Models.SubscriptionScheduleConfigurationItem => Models.SubscriptionScheduleConfigurationItem)),
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  on_behalf_of: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Account => Models.Account))),
  proration_behavior: Schema.Literal("always_invoice", "create_prorations", "none"),
  start_date: Schema.Number,
  transfer_data: Schema.NullOr(Schema.suspend((): typeof Models.SubscriptionTransferData => Models.SubscriptionTransferData)),
  trial_end: Schema.NullOr(Schema.Number),
})
export type SubscriptionSchedulePhaseConfiguration = typeof SubscriptionSchedulePhaseConfiguration.Type
