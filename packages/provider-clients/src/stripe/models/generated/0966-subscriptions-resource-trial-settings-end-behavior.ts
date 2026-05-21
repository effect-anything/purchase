import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionsResourceTrialSettingsEndBehavior = Schema.Struct({
  missing_payment_method: Schema.Literal("cancel", "create_invoice", "pause")
})
export type SubscriptionsResourceTrialSettingsEndBehavior = typeof SubscriptionsResourceTrialSettingsEndBehavior.Type
