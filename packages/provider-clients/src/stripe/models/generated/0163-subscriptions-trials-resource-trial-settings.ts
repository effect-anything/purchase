import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionsTrialsResourceTrialSettings = Schema.Struct({
  end_behavior: Schema.suspend((): typeof Models.SubscriptionsTrialsResourceEndBehavior => Models.SubscriptionsTrialsResourceEndBehavior),
})
export type SubscriptionsTrialsResourceTrialSettings = typeof SubscriptionsTrialsResourceTrialSettings.Type
