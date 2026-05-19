import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionAutomaticTax = Schema.Struct({
  enabled: Schema.Boolean,
  liability: Schema.NullOr(Schema.suspend((): typeof Models.ConnectAccountReference => Models.ConnectAccountReference)),
  provider: Schema.NullOr(Schema.String),
  status: Schema.NullOr(Schema.Literal("complete", "failed", "requires_location_inputs")),
})
export type PaymentPagesCheckoutSessionAutomaticTax = typeof PaymentPagesCheckoutSessionAutomaticTax.Type
