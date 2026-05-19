import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionUpdateTrial = Schema.Struct({
  trial_end: Schema.Union(Schema.String, Schema.String),
})
export type SubscriptionUpdateTrial = typeof SubscriptionUpdateTrial.Type
