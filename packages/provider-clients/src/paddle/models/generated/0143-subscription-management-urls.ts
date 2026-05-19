import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionManagementUrls = Schema.Struct({
  update_payment_method: Schema.NullOr(Schema.String),
  cancel: Schema.String,
})
export type SubscriptionManagementUrls = typeof SubscriptionManagementUrls.Type
