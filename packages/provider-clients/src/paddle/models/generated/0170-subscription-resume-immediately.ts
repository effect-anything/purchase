import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionResumeImmediately = Schema.Struct({
  effective_from: Schema.NullOr(
    Schema.suspend((): Schema.Schema<Models.EffectiveFromImmediately> => Models.EffectiveFromImmediately)
  ),
  on_resume: Schema.optional(
    Schema.suspend((): Schema.Schema<Models.SubscriptionOnResume> => Models.SubscriptionOnResume)
  )
})
export type SubscriptionResumeImmediately = typeof SubscriptionResumeImmediately.Type
