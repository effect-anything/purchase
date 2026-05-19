import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionsResourceTrialSettingsTrialSettings = Schema.Struct({
  end_behavior: Schema.suspend((): typeof Models.SubscriptionsResourceTrialSettingsEndBehavior => Models.SubscriptionsResourceTrialSettingsEndBehavior),
})
export type SubscriptionsResourceTrialSettingsTrialSettings = typeof SubscriptionsResourceTrialSettingsTrialSettings.Type
