import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentFlowsAutomaticPaymentMethodsPaymentIntent = Schema.Struct({
  allow_redirects: Schema.optional(Schema.Literal("always", "never")),
  enabled: Schema.Boolean,
})
export type PaymentFlowsAutomaticPaymentMethodsPaymentIntent = typeof PaymentFlowsAutomaticPaymentMethodsPaymentIntent.Type
