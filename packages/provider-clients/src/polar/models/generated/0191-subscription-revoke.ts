import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionRevoke = Schema.Struct({
  customer_cancellation_reason: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.CustomerCancellationReason => Models.CustomerCancellationReason))),
  customer_cancellation_comment: Schema.optional(Schema.NullOr(Schema.String)),
  revoke: Schema.Boolean,
})
export type SubscriptionRevoke = typeof SubscriptionRevoke.Type
