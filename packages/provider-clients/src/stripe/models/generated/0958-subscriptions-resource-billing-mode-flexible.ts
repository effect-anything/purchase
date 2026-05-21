import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionsResourceBillingModeFlexible = Schema.Struct({
  proration_discounts: Schema.optional(Schema.Literal("included", "itemized"))
})
export type SubscriptionsResourceBillingModeFlexible = typeof SubscriptionsResourceBillingModeFlexible.Type
