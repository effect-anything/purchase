import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionsResourceBillingMode = Schema.Struct({
  flexible: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SubscriptionsResourceBillingModeFlexible, any, any> =>
        Models.SubscriptionsResourceBillingModeFlexible as Schema.Schema<
          Models.SubscriptionsResourceBillingModeFlexible,
          any,
          any
        >
    )
  ),
  type: Schema.Literal("classic", "flexible"),
  updated_at: Schema.optional(Schema.Number)
})
export type SubscriptionsResourceBillingMode = typeof SubscriptionsResourceBillingMode.Type
