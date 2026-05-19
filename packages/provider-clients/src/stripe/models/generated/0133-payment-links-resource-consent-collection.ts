import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentLinksResourceConsentCollection = Schema.Struct({
  payment_method_reuse_agreement: Schema.NullOr(Schema.suspend((): typeof Models.PaymentLinksResourcePaymentMethodReuseAgreement => Models.PaymentLinksResourcePaymentMethodReuseAgreement)),
  promotions: Schema.NullOr(Schema.Literal("auto", "none")),
  terms_of_service: Schema.NullOr(Schema.Literal("none", "required")),
})
export type PaymentLinksResourceConsentCollection = typeof PaymentLinksResourceConsentCollection.Type
