import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionAutomaticTax = Schema.Struct({
  enabled: Schema.Boolean,
  liability: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ConnectAccountReference, any, any> =>
        Models.ConnectAccountReference as Schema.Schema<Models.ConnectAccountReference, any, any>
    )
  ),
  provider: Schema.NullOr(Schema.String),
  status: Schema.NullOr(Schema.Literal("complete", "failed", "requires_location_inputs"))
})
export type PaymentPagesCheckoutSessionAutomaticTax = typeof PaymentPagesCheckoutSessionAutomaticTax.Type
