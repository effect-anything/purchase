import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentFlowsAutomaticPaymentMethodsSetupIntent = Schema.Struct({
  allow_redirects: Schema.optional(Schema.Literal("always", "never")),
  enabled: Schema.NullOr(Schema.Boolean),
})
export type PaymentFlowsAutomaticPaymentMethodsSetupIntent = typeof PaymentFlowsAutomaticPaymentMethodsSetupIntent.Type
