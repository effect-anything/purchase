import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const Mandate = Schema.Struct({
  customer_acceptance: Schema.suspend((): typeof Models.CustomerAcceptance => Models.CustomerAcceptance),
  id: Schema.String,
  livemode: Schema.Boolean,
  multi_use: Schema.optional(Schema.suspend((): typeof Models.MandateMultiUse => Models.MandateMultiUse)),
  object: Schema.Literal("mandate"),
  on_behalf_of: Schema.optional(Schema.String),
  payment_method: Schema.Union(Schema.String, Schema.suspend((): typeof Models.PaymentMethod => Models.PaymentMethod)),
  payment_method_details: Schema.suspend((): typeof Models.MandatePaymentMethodDetails => Models.MandatePaymentMethodDetails),
  single_use: Schema.optional(Schema.suspend((): typeof Models.MandateSingleUse => Models.MandateSingleUse)),
  status: Schema.Literal("active", "inactive", "pending"),
  type: Schema.Literal("multi_use", "single_use"),
})
export type Mandate = typeof Mandate.Type
