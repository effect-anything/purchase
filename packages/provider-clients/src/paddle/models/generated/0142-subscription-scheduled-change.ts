import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionScheduledChange = Schema.Struct({
  action: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionScheduledChangeAction> => Models.SubscriptionScheduledChangeAction
  ),
  effective_at: Schema.suspend((): Schema.Schema<Models.Timestamp> => Models.Timestamp),
  resume_at: Schema.NullOr(Schema.suspend((): Schema.Schema<Models.Timestamp> => Models.Timestamp))
})
export type SubscriptionScheduledChange = typeof SubscriptionScheduledChange.Type
