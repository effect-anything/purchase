import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type SubscriptionSchedulePhaseConfiguration = {
  readonly add_invoice_items: ReadonlyArray<Models.SubscriptionScheduleAddInvoiceItem>
  readonly application_fee_percent: number | null
  readonly automatic_tax?: Models.SchedulesPhaseAutomaticTax
  readonly billing_cycle_anchor: "automatic" | "phase_start" | null
  readonly billing_thresholds: Models.SubscriptionBillingThresholds | null
  readonly collection_method: "charge_automatically" | "send_invoice" | null
  readonly currency: string
  readonly default_payment_method: string | Models.PaymentMethod | null
  readonly default_tax_rates?: ReadonlyArray<Models.TaxRate> | null
  readonly description: string | null
  readonly discounts: ReadonlyArray<Models.StackableDiscountWithDiscountSettingsAndDiscountEnd>
  readonly end_date: number
  readonly invoice_settings: Models.InvoiceSettingSubscriptionSchedulePhaseSetting | null
  readonly items: ReadonlyArray<Models.SubscriptionScheduleConfigurationItem>
  readonly metadata: Readonly<Record<string, string>> | null
  readonly on_behalf_of: string | Models.Account | null
  readonly proration_behavior: "always_invoice" | "create_prorations" | "none"
  readonly start_date: number
  readonly transfer_data: Models.SubscriptionTransferData | null
  readonly trial_end: number | null
}

export const SubscriptionSchedulePhaseConfiguration = Schema.Struct({
  add_invoice_items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionScheduleAddInvoiceItem, any, any> =>
        Models.SubscriptionScheduleAddInvoiceItem as Schema.Schema<Models.SubscriptionScheduleAddInvoiceItem, any, any>
    )
  ),
  application_fee_percent: Schema.NullOr(Schema.Number),
  automatic_tax: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SchedulesPhaseAutomaticTax, any, any> =>
        Models.SchedulesPhaseAutomaticTax as Schema.Schema<Models.SchedulesPhaseAutomaticTax, any, any>
    )
  ),
  billing_cycle_anchor: Schema.NullOr(Schema.Literal("automatic", "phase_start")),
  billing_thresholds: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionBillingThresholds, any, any> =>
        Models.SubscriptionBillingThresholds as Schema.Schema<Models.SubscriptionBillingThresholds, any, any>
    )
  ),
  collection_method: Schema.NullOr(Schema.Literal("charge_automatically", "send_invoice")),
  currency: Schema.String,
  default_payment_method: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PaymentMethod, any, any> =>
          Models.PaymentMethod as Schema.Schema<Models.PaymentMethod, any, any>
      )
    )
  ),
  default_tax_rates: Schema.optional(
    Schema.NullOr(
      Schema.Array(
        Schema.suspend(
          (): Schema.Schema<Models.TaxRate, any, any> => Models.TaxRate as Schema.Schema<Models.TaxRate, any, any>
        )
      )
    )
  ),
  description: Schema.NullOr(Schema.String),
  discounts: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.StackableDiscountWithDiscountSettingsAndDiscountEnd, any, any> =>
        Models.StackableDiscountWithDiscountSettingsAndDiscountEnd as Schema.Schema<
          Models.StackableDiscountWithDiscountSettingsAndDiscountEnd,
          any,
          any
        >
    )
  ),
  end_date: Schema.Number,
  invoice_settings: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.InvoiceSettingSubscriptionSchedulePhaseSetting, any, any> =>
        Models.InvoiceSettingSubscriptionSchedulePhaseSetting as Schema.Schema<
          Models.InvoiceSettingSubscriptionSchedulePhaseSetting,
          any,
          any
        >
    )
  ),
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionScheduleConfigurationItem, any, any> =>
        Models.SubscriptionScheduleConfigurationItem as Schema.Schema<
          Models.SubscriptionScheduleConfigurationItem,
          any,
          any
        >
    )
  ),
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  on_behalf_of: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Account, any, any> => Models.Account as Schema.Schema<Models.Account, any, any>
      )
    )
  ),
  proration_behavior: Schema.Literal("always_invoice", "create_prorations", "none"),
  start_date: Schema.Number,
  transfer_data: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionTransferData, any, any> =>
        Models.SubscriptionTransferData as Schema.Schema<Models.SubscriptionTransferData, any, any>
    )
  ),
  trial_end: Schema.NullOr(Schema.Number)
})
