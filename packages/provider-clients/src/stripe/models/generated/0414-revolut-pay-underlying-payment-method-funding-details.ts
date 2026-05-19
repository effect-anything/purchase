import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const RevolutPayUnderlyingPaymentMethodFundingDetails = Schema.Struct({
  card: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodDetailsPassthroughCard => Models.PaymentMethodDetailsPassthroughCard)),
  type: Schema.NullOr(Schema.Literal("card")),
})
export type RevolutPayUnderlyingPaymentMethodFundingDetails = typeof RevolutPayUnderlyingPaymentMethodFundingDetails.Type
