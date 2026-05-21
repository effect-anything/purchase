import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type SubscriptionSchedule = {
  readonly application: string | Models.Application | Models.DeletedApplication | null
  readonly billing_mode: Models.SubscriptionsResourceBillingMode
  readonly canceled_at: number | null
  readonly completed_at: number | null
  readonly created: number
  readonly current_phase: Models.SubscriptionScheduleCurrentPhase | null
  readonly customer: string | Models.Customer | Models.DeletedCustomer
  readonly customer_account: string | null
  readonly default_settings: Models.SubscriptionSchedulesResourceDefaultSettings
  readonly end_behavior: "cancel" | "none" | "release" | "renew"
  readonly id: string
  readonly livemode: boolean
  readonly metadata: Readonly<Record<string, string>> | null
  readonly object: "subscription_schedule"
  readonly phases: ReadonlyArray<Models.SubscriptionSchedulePhaseConfiguration>
  readonly released_at: number | null
  readonly released_subscription: string | null
  readonly status: "active" | "canceled" | "completed" | "not_started" | "released"
  readonly subscription: string | Models.Subscription | null
  readonly test_clock: string | Models.TestHelpersTestClock | null
}

export const SubscriptionSchedule = Schema.Struct({
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
  billing_mode: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionsResourceBillingMode, any, any> =>
      Models.SubscriptionsResourceBillingMode as Schema.Schema<Models.SubscriptionsResourceBillingMode, any, any>
  ),
  canceled_at: Schema.NullOr(Schema.Number),
  completed_at: Schema.NullOr(Schema.Number),
  created: Schema.Number,
  current_phase: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionScheduleCurrentPhase, any, any> =>
        Models.SubscriptionScheduleCurrentPhase as Schema.Schema<Models.SubscriptionScheduleCurrentPhase, any, any>
    )
  ),
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
  default_settings: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionSchedulesResourceDefaultSettings, any, any> =>
      Models.SubscriptionSchedulesResourceDefaultSettings as Schema.Schema<
        Models.SubscriptionSchedulesResourceDefaultSettings,
        any,
        any
      >
  ),
  end_behavior: Schema.Literal("cancel", "none", "release", "renew"),
  id: Schema.String,
  livemode: Schema.Boolean,
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  object: Schema.Literal("subscription_schedule"),
  phases: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionSchedulePhaseConfiguration, any, any> =>
        Models.SubscriptionSchedulePhaseConfiguration as Schema.Schema<
          Models.SubscriptionSchedulePhaseConfiguration,
          any,
          any
        >
    )
  ),
  released_at: Schema.NullOr(Schema.Number),
  released_subscription: Schema.NullOr(Schema.String),
  status: Schema.Literal("active", "canceled", "completed", "not_started", "released"),
  subscription: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Subscription, any, any> =>
          Models.Subscription as Schema.Schema<Models.Subscription, any, any>
      )
    )
  ),
  test_clock: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.TestHelpersTestClock, any, any> =>
          Models.TestHelpersTestClock as Schema.Schema<Models.TestHelpersTestClock, any, any>
      )
    )
  )
})
