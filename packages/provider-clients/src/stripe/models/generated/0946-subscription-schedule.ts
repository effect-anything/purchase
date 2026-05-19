import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionSchedule = Schema.Struct({
  application: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Application => Models.Application), Schema.suspend((): typeof Models.DeletedApplication => Models.DeletedApplication))),
  billing_mode: Schema.suspend((): typeof Models.SubscriptionsResourceBillingMode => Models.SubscriptionsResourceBillingMode),
  canceled_at: Schema.NullOr(Schema.Number),
  completed_at: Schema.NullOr(Schema.Number),
  created: Schema.Number,
  current_phase: Schema.NullOr(Schema.suspend((): typeof Models.SubscriptionScheduleCurrentPhase => Models.SubscriptionScheduleCurrentPhase)),
  customer: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Customer => Models.Customer), Schema.suspend((): typeof Models.DeletedCustomer => Models.DeletedCustomer)),
  customer_account: Schema.NullOr(Schema.String),
  default_settings: Schema.suspend((): typeof Models.SubscriptionSchedulesResourceDefaultSettings => Models.SubscriptionSchedulesResourceDefaultSettings),
  end_behavior: Schema.Literal("cancel", "none", "release", "renew"),
  id: Schema.String,
  livemode: Schema.Boolean,
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  object: Schema.Literal("subscription_schedule"),
  phases: Schema.Array(Schema.suspend((): typeof Models.SubscriptionSchedulePhaseConfiguration => Models.SubscriptionSchedulePhaseConfiguration)),
  released_at: Schema.NullOr(Schema.Number),
  released_subscription: Schema.NullOr(Schema.String),
  status: Schema.Literal("active", "canceled", "completed", "not_started", "released"),
  subscription: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Subscription => Models.Subscription))),
  test_clock: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.TestHelpersTestClock => Models.TestHelpersTestClock))),
})
export type SubscriptionSchedule = typeof SubscriptionSchedule.Type
