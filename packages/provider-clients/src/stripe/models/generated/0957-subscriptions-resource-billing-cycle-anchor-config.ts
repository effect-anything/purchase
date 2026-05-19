import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionsResourceBillingCycleAnchorConfig = Schema.Struct({
  day_of_month: Schema.Number,
  hour: Schema.NullOr(Schema.Number),
  minute: Schema.NullOr(Schema.Number),
  month: Schema.NullOr(Schema.Number),
  second: Schema.NullOr(Schema.Number),
})
export type SubscriptionsResourceBillingCycleAnchorConfig = typeof SubscriptionsResourceBillingCycleAnchorConfig.Type
