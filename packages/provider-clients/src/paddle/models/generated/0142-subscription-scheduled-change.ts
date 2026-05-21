import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionScheduledChange = Schema.Struct({
  action: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionScheduledChangeAction, any, any> =>
      Models.SubscriptionScheduledChangeAction as Schema.Schema<Models.SubscriptionScheduledChangeAction, any, any>
  ),
  effective_at: Schema.suspend(
    (): Schema.Schema<Models.Timestamp, any, any> => Models.Timestamp as Schema.Schema<Models.Timestamp, any, any>
  ),
  resume_at: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Timestamp, any, any> => Models.Timestamp as Schema.Schema<Models.Timestamp, any, any>
    )
  )
})
export type SubscriptionScheduledChange = typeof SubscriptionScheduledChange.Type
