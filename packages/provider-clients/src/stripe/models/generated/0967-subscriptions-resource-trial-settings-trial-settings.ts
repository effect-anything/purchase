import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionsResourceTrialSettingsTrialSettings = Schema.Struct({
  end_behavior: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionsResourceTrialSettingsEndBehavior, any, any> =>
      Models.SubscriptionsResourceTrialSettingsEndBehavior as Schema.Schema<
        Models.SubscriptionsResourceTrialSettingsEndBehavior,
        any,
        any
      >
  )
})
export type SubscriptionsResourceTrialSettingsTrialSettings =
  typeof SubscriptionsResourceTrialSettingsTrialSettings.Type
