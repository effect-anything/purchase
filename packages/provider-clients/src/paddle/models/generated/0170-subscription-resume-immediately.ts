import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionResumeImmediately = Schema.Struct({
  effective_from: Schema.NullOr(Schema.suspend(() => Models.EffectiveFromImmediately)),
  on_resume: Schema.optional(Schema.suspend(() => Models.SubscriptionOnResume)),
})
export type SubscriptionResumeImmediately = typeof SubscriptionResumeImmediately.Type
