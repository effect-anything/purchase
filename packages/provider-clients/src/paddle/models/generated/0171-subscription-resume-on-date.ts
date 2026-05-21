import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionResumeOnDate = Schema.Struct({
  effective_from: Schema.suspend(
    (): Schema.Schema<Models.Timestamp, any, any> => Models.Timestamp as Schema.Schema<Models.Timestamp, any, any>
  ),
  on_resume: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionOnResume, any, any> =>
        Models.SubscriptionOnResume as Schema.Schema<Models.SubscriptionOnResume, any, any>
    )
  )
})
export type SubscriptionResumeOnDate = typeof SubscriptionResumeOnDate.Type
