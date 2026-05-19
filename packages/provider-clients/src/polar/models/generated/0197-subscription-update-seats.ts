import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionUpdateSeats = Schema.Struct({
  seats: Schema.Number,
  proration_behavior: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.SubscriptionProrationBehavior => Models.SubscriptionProrationBehavior))),
})
export type SubscriptionUpdateSeats = typeof SubscriptionUpdateSeats.Type
