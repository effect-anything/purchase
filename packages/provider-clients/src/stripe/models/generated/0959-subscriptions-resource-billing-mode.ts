import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionsResourceBillingMode = Schema.Struct({
  flexible: Schema.NullOr(Schema.suspend((): typeof Models.SubscriptionsResourceBillingModeFlexible => Models.SubscriptionsResourceBillingModeFlexible)),
  type: Schema.Literal("classic", "flexible"),
  updated_at: Schema.optional(Schema.Number),
})
export type SubscriptionsResourceBillingMode = typeof SubscriptionsResourceBillingMode.Type
