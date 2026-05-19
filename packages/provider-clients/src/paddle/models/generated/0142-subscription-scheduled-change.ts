import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionScheduledChange = Schema.Struct({
  action: Schema.suspend(() => Models.SubscriptionScheduledChangeAction),
  effective_at: Schema.suspend(() => Models.Timestamp),
  resume_at: Schema.NullOr(Schema.suspend(() => Models.Timestamp)),
})
export type SubscriptionScheduledChange = typeof SubscriptionScheduledChange.Type
