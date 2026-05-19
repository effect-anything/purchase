import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutSession = Schema.Struct({
  checkout_id: Schema.String,
  checkout_url: Schema.optional(Schema.String),
  status: Schema.optional(Schema.String),
  payment_id: Schema.optional(Schema.NullOr(Schema.String)),
  subscription_id: Schema.optional(Schema.NullOr(Schema.String)),
})
export type CheckoutSession = typeof CheckoutSession.Type
