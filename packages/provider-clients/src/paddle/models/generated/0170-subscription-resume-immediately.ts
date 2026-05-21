import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionResumeImmediately = Schema.Struct({
  effective_from: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.EffectiveFromImmediately, any, any> =>
        Models.EffectiveFromImmediately as Schema.Schema<Models.EffectiveFromImmediately, any, any>
    )
  ),
  on_resume: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionOnResume, any, any> =>
        Models.SubscriptionOnResume as Schema.Schema<Models.SubscriptionOnResume, any, any>
    )
  )
})
export type SubscriptionResumeImmediately = typeof SubscriptionResumeImmediately.Type
