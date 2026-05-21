import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionUpdateSeats = Schema.Struct({
  seats: Schema.Number,
  proration_behavior: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.SubscriptionProrationBehavior, any, any> =>
          Models.SubscriptionProrationBehavior as Schema.Schema<Models.SubscriptionProrationBehavior, any, any>
      )
    )
  )
})
export type SubscriptionUpdateSeats = typeof SubscriptionUpdateSeats.Type
