import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type SubscriptionSchedulesResourceDefaultSettings = {
  readonly application_fee_percent: number | null
  readonly automatic_tax?: Models.SubscriptionSchedulesResourceDefaultSettingsAutomaticTax
  readonly billing_cycle_anchor: "automatic" | "phase_start"
  readonly billing_thresholds: Models.SubscriptionBillingThresholds | null
  readonly collection_method: "charge_automatically" | "send_invoice" | null
  readonly default_payment_method: string | Models.PaymentMethod | null
  readonly description: string | null
  readonly invoice_settings: Models.InvoiceSettingSubscriptionScheduleSetting
  readonly on_behalf_of: string | Models.Account | null
  readonly transfer_data: Models.SubscriptionTransferData | null
}

export const SubscriptionSchedulesResourceDefaultSettings = Schema.Struct({
  application_fee_percent: Schema.NullOr(Schema.Number),
  automatic_tax: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionSchedulesResourceDefaultSettingsAutomaticTax, any, any> =>
        Models.SubscriptionSchedulesResourceDefaultSettingsAutomaticTax as Schema.Schema<
          Models.SubscriptionSchedulesResourceDefaultSettingsAutomaticTax,
          any,
          any
        >
    )
  ),
  billing_cycle_anchor: Schema.Literal("automatic", "phase_start"),
  billing_thresholds: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionBillingThresholds, any, any> =>
        Models.SubscriptionBillingThresholds as Schema.Schema<Models.SubscriptionBillingThresholds, any, any>
    )
  ),
  collection_method: Schema.NullOr(Schema.Literal("charge_automatically", "send_invoice")),
  default_payment_method: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PaymentMethod, any, any> =>
          Models.PaymentMethod as Schema.Schema<Models.PaymentMethod, any, any>
      )
    )
  ),
  description: Schema.NullOr(Schema.String),
  invoice_settings: Schema.suspend(
    (): Schema.Schema<Models.InvoiceSettingSubscriptionScheduleSetting, any, any> =>
      Models.InvoiceSettingSubscriptionScheduleSetting as Schema.Schema<
        Models.InvoiceSettingSubscriptionScheduleSetting,
        any,
        any
      >
  ),
  on_behalf_of: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Account, any, any> => Models.Account as Schema.Schema<Models.Account, any, any>
      )
    )
  ),
  transfer_data: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionTransferData, any, any> =>
        Models.SubscriptionTransferData as Schema.Schema<Models.SubscriptionTransferData, any, any>
    )
  )
})
