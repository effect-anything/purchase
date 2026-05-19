import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionConsentCollection = Schema.Struct({
  payment_method_reuse_agreement: Schema.NullOr(Schema.suspend((): typeof Models.PaymentPagesCheckoutSessionPaymentMethodReuseAgreement => Models.PaymentPagesCheckoutSessionPaymentMethodReuseAgreement)),
  promotions: Schema.NullOr(Schema.Literal("auto", "none")),
  terms_of_service: Schema.NullOr(Schema.Literal("none", "required")),
})
export type PaymentPagesCheckoutSessionConsentCollection = typeof PaymentPagesCheckoutSessionConsentCollection.Type
