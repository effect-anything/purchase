import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionResumeOnDate = Schema.Struct({
  effective_from: Schema.suspend((): Schema.Schema<Models.Timestamp> => Models.Timestamp),
  on_resume: Schema.optional(
    Schema.suspend((): Schema.Schema<Models.SubscriptionOnResume> => Models.SubscriptionOnResume)
  )
})
export type SubscriptionResumeOnDate = typeof SubscriptionResumeOnDate.Type
