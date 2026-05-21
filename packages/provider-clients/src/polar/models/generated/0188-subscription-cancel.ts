import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionCancel = Schema.Struct({
  customer_cancellation_reason: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.CustomerCancellationReason, any, any> =>
          Models.CustomerCancellationReason as Schema.Schema<Models.CustomerCancellationReason, any, any>
      )
    )
  ),
  customer_cancellation_comment: Schema.optional(Schema.NullOr(Schema.String)),
  cancel_at_period_end: Schema.Boolean
})
export type SubscriptionCancel = typeof SubscriptionCancel.Type
