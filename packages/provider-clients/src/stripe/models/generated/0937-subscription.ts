import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type Subscription = {
  readonly application: string | Models.Application | Models.DeletedApplication | null
  readonly application_fee_percent: number | null
  readonly automatic_tax: Models.SubscriptionAutomaticTax
  readonly billing_cycle_anchor: number
  readonly billing_cycle_anchor_config: Models.SubscriptionsResourceBillingCycleAnchorConfig | null
  readonly billing_mode: Models.SubscriptionsResourceBillingMode
  readonly billing_thresholds: Models.SubscriptionBillingThresholds | null
  readonly cancel_at: number | null
  readonly cancel_at_period_end: boolean
  readonly canceled_at: number | null
  readonly cancellation_details: Models.CancellationDetails | null
  readonly collection_method: "charge_automatically" | "send_invoice"
  readonly created: number
  readonly currency: string
  readonly customer: string | Models.Customer | Models.DeletedCustomer
  readonly customer_account: string | null
  readonly days_until_due: number | null
  readonly default_payment_method: string | Models.PaymentMethod | null
  readonly default_source: string | Models.PaymentSource | null
  readonly default_tax_rates?: ReadonlyArray<Models.TaxRate> | null
  readonly description: string | null
  readonly discounts: ReadonlyArray<string | Models.Discount>
  readonly ended_at: number | null
  readonly id: string
  readonly invoice_settings: Models.SubscriptionsResourceSubscriptionInvoiceSettings
  readonly items: {
    readonly data: ReadonlyArray<Models.SubscriptionItem>
    readonly has_more: boolean
    readonly object: "list"
    readonly url: string
  }
  readonly latest_invoice: string | Models.Invoice | null
  readonly livemode: boolean
  readonly managed_payments: Models.SmorResourceManagedPayments | null
  readonly metadata: Readonly<Record<string, string>>
  readonly next_pending_invoice_item_invoice: number | null
  readonly object: "subscription"
  readonly on_behalf_of: string | Models.Account | null
  readonly pause_collection: Models.SubscriptionsResourcePauseCollection | null
  readonly payment_settings: Models.SubscriptionsResourcePaymentSettings | null
  readonly pending_invoice_item_interval: Models.SubscriptionPendingInvoiceItemInterval | null
  readonly pending_setup_intent: string | Models.SetupIntent | null
  readonly pending_update: Models.SubscriptionsResourcePendingUpdate | null
  readonly presentment_details?: Models.SubscriptionsResourceSubscriptionPresentmentDetails
  readonly schedule: string | Models.SubscriptionSchedule | null
  readonly start_date: number
  readonly status:
    | "active"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "paused"
    | "trialing"
    | "unpaid"
  readonly test_clock: string | Models.TestHelpersTestClock | null
  readonly transfer_data: Models.SubscriptionTransferData | null
  readonly trial_end: number | null
  readonly trial_settings: Models.SubscriptionsResourceTrialSettingsTrialSettings | null
  readonly trial_start: number | null
}

export const Subscription = Schema.Struct({
  application: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Application, any, any> =>
          Models.Application as Schema.Schema<Models.Application, any, any>
      ),
      Schema.suspend(
        (): Schema.Schema<Models.DeletedApplication, any, any> =>
          Models.DeletedApplication as Schema.Schema<Models.DeletedApplication, any, any>
      )
    )
  ),
  application_fee_percent: Schema.NullOr(Schema.Number),
  automatic_tax: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionAutomaticTax, any, any> =>
      Models.SubscriptionAutomaticTax as Schema.Schema<Models.SubscriptionAutomaticTax, any, any>
  ),
  billing_cycle_anchor: Schema.Number,
  billing_cycle_anchor_config: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionsResourceBillingCycleAnchorConfig, any, any> =>
        Models.SubscriptionsResourceBillingCycleAnchorConfig as Schema.Schema<
          Models.SubscriptionsResourceBillingCycleAnchorConfig,
          any,
          any
        >
    )
  ),
  billing_mode: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionsResourceBillingMode, any, any> =>
      Models.SubscriptionsResourceBillingMode as Schema.Schema<Models.SubscriptionsResourceBillingMode, any, any>
  ),
  billing_thresholds: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionBillingThresholds, any, any> =>
        Models.SubscriptionBillingThresholds as Schema.Schema<Models.SubscriptionBillingThresholds, any, any>
    )
  ),
  cancel_at: Schema.NullOr(Schema.Number),
  cancel_at_period_end: Schema.Boolean,
  canceled_at: Schema.NullOr(Schema.Number),
  cancellation_details: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.CancellationDetails, any, any> =>
        Models.CancellationDetails as Schema.Schema<Models.CancellationDetails, any, any>
    )
  ),
  collection_method: Schema.Literal("charge_automatically", "send_invoice"),
  created: Schema.Number,
  currency: Schema.String,
  customer: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Customer, any, any> => Models.Customer as Schema.Schema<Models.Customer, any, any>
    ),
    Schema.suspend(
      (): Schema.Schema<Models.DeletedCustomer, any, any> =>
        Models.DeletedCustomer as Schema.Schema<Models.DeletedCustomer, any, any>
    )
  ),
  customer_account: Schema.NullOr(Schema.String),
  days_until_due: Schema.NullOr(Schema.Number),
  default_payment_method: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PaymentMethod, any, any> =>
          Models.PaymentMethod as Schema.Schema<Models.PaymentMethod, any, any>
      )
    )
  ),
  default_source: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PaymentSource, any, any> =>
          Models.PaymentSource as Schema.Schema<Models.PaymentSource, any, any>
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
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Discount, any, any> => Models.Discount as Schema.Schema<Models.Discount, any, any>
      )
    )
  ),
  ended_at: Schema.NullOr(Schema.Number),
  id: Schema.String,
  invoice_settings: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionsResourceSubscriptionInvoiceSettings, any, any> =>
      Models.SubscriptionsResourceSubscriptionInvoiceSettings as Schema.Schema<
        Models.SubscriptionsResourceSubscriptionInvoiceSettings,
        any,
        any
      >
  ),
  items: Schema.Struct({
    data: Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.SubscriptionItem, any, any> =>
          Models.SubscriptionItem as Schema.Schema<Models.SubscriptionItem, any, any>
      )
    ),
    has_more: Schema.Boolean,
    object: Schema.Literal("list"),
    url: Schema.String
  }),
  latest_invoice: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Invoice, any, any> => Models.Invoice as Schema.Schema<Models.Invoice, any, any>
      )
    )
  ),
  livemode: Schema.Boolean,
  managed_payments: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SmorResourceManagedPayments, any, any> =>
        Models.SmorResourceManagedPayments as Schema.Schema<Models.SmorResourceManagedPayments, any, any>
    )
  ),
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  next_pending_invoice_item_invoice: Schema.NullOr(Schema.Number),
  object: Schema.Literal("subscription"),
  on_behalf_of: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Account, any, any> => Models.Account as Schema.Schema<Models.Account, any, any>
      )
    )
  ),
  pause_collection: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionsResourcePauseCollection, any, any> =>
        Models.SubscriptionsResourcePauseCollection as Schema.Schema<
          Models.SubscriptionsResourcePauseCollection,
          any,
          any
        >
    )
  ),
  payment_settings: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionsResourcePaymentSettings, any, any> =>
        Models.SubscriptionsResourcePaymentSettings as Schema.Schema<
          Models.SubscriptionsResourcePaymentSettings,
          any,
          any
        >
    )
  ),
  pending_invoice_item_interval: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionPendingInvoiceItemInterval, any, any> =>
        Models.SubscriptionPendingInvoiceItemInterval as Schema.Schema<
          Models.SubscriptionPendingInvoiceItemInterval,
          any,
          any
        >
    )
  ),
  pending_setup_intent: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.SetupIntent, any, any> =>
          Models.SetupIntent as Schema.Schema<Models.SetupIntent, any, any>
      )
    )
  ),
  pending_update: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionsResourcePendingUpdate, any, any> =>
        Models.SubscriptionsResourcePendingUpdate as Schema.Schema<Models.SubscriptionsResourcePendingUpdate, any, any>
    )
  ),
  presentment_details: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionsResourceSubscriptionPresentmentDetails, any, any> =>
        Models.SubscriptionsResourceSubscriptionPresentmentDetails as Schema.Schema<
          Models.SubscriptionsResourceSubscriptionPresentmentDetails,
          any,
          any
        >
    )
  ),
  schedule: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.SubscriptionSchedule, any, any> =>
          Models.SubscriptionSchedule as Schema.Schema<Models.SubscriptionSchedule, any, any>
      )
    )
  ),
  start_date: Schema.Number,
  status: Schema.Literal(
    "active",
    "canceled",
    "incomplete",
    "incomplete_expired",
    "past_due",
    "paused",
    "trialing",
    "unpaid"
  ),
  test_clock: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.TestHelpersTestClock, any, any> =>
          Models.TestHelpersTestClock as Schema.Schema<Models.TestHelpersTestClock, any, any>
      )
    )
  ),
  transfer_data: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionTransferData, any, any> =>
        Models.SubscriptionTransferData as Schema.Schema<Models.SubscriptionTransferData, any, any>
    )
  ),
  trial_end: Schema.NullOr(Schema.Number),
  trial_settings: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionsResourceTrialSettingsTrialSettings, any, any> =>
        Models.SubscriptionsResourceTrialSettingsTrialSettings as Schema.Schema<
          Models.SubscriptionsResourceTrialSettingsTrialSettings,
          any,
          any
        >
    )
  ),
  trial_start: Schema.NullOr(Schema.Number)
})
