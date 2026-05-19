import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionSchedulesResourceDefaultSettingsAutomaticTax = Schema.Struct({
  disabled_reason: Schema.NullOr(Schema.Literal("requires_location_inputs")),
  enabled: Schema.Boolean,
  liability: Schema.NullOr(Schema.suspend((): typeof Models.ConnectAccountReference => Models.ConnectAccountReference)),
})
export type SubscriptionSchedulesResourceDefaultSettingsAutomaticTax = typeof SubscriptionSchedulesResourceDefaultSettingsAutomaticTax.Type
