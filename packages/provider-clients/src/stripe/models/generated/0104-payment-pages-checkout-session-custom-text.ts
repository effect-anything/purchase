import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionCustomText = Schema.Struct({
  after_submit: Schema.NullOr(Schema.suspend((): typeof Models.PaymentPagesCheckoutSessionCustomTextPosition => Models.PaymentPagesCheckoutSessionCustomTextPosition)),
  shipping_address: Schema.NullOr(Schema.suspend((): typeof Models.PaymentPagesCheckoutSessionCustomTextPosition => Models.PaymentPagesCheckoutSessionCustomTextPosition)),
  submit: Schema.NullOr(Schema.suspend((): typeof Models.PaymentPagesCheckoutSessionCustomTextPosition => Models.PaymentPagesCheckoutSessionCustomTextPosition)),
  terms_of_service_acceptance: Schema.NullOr(Schema.suspend((): typeof Models.PaymentPagesCheckoutSessionCustomTextPosition => Models.PaymentPagesCheckoutSessionCustomTextPosition)),
})
export type PaymentPagesCheckoutSessionCustomText = typeof PaymentPagesCheckoutSessionCustomText.Type
