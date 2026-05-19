import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionResumeOnDate = Schema.Struct({
  effective_from: Schema.suspend(() => Models.Timestamp),
  on_resume: Schema.optional(Schema.suspend(() => Models.SubscriptionOnResume)),
})
export type SubscriptionResumeOnDate = typeof SubscriptionResumeOnDate.Type
