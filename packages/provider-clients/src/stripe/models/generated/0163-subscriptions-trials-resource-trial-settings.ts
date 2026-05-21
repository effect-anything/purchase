import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionsTrialsResourceTrialSettings = Schema.Struct({
  end_behavior: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionsTrialsResourceEndBehavior, any, any> =>
      Models.SubscriptionsTrialsResourceEndBehavior as Schema.Schema<
        Models.SubscriptionsTrialsResourceEndBehavior,
        any,
        any
      >
  )
})
export type SubscriptionsTrialsResourceTrialSettings = typeof SubscriptionsTrialsResourceTrialSettings.Type
