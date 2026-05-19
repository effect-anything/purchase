import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionPaymentMethodReuseAgreement = Schema.Struct({
  position: Schema.Literal("auto", "hidden"),
})
export type PaymentPagesCheckoutSessionPaymentMethodReuseAgreement = typeof PaymentPagesCheckoutSessionPaymentMethodReuseAgreement.Type
