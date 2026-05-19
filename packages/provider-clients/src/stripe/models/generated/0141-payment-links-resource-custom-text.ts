import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentLinksResourceCustomText = Schema.Struct({
  after_submit: Schema.NullOr(Schema.suspend((): typeof Models.PaymentLinksResourceCustomTextPosition => Models.PaymentLinksResourceCustomTextPosition)),
  shipping_address: Schema.NullOr(Schema.suspend((): typeof Models.PaymentLinksResourceCustomTextPosition => Models.PaymentLinksResourceCustomTextPosition)),
  submit: Schema.NullOr(Schema.suspend((): typeof Models.PaymentLinksResourceCustomTextPosition => Models.PaymentLinksResourceCustomTextPosition)),
  terms_of_service_acceptance: Schema.NullOr(Schema.suspend((): typeof Models.PaymentLinksResourceCustomTextPosition => Models.PaymentLinksResourceCustomTextPosition)),
})
export type PaymentLinksResourceCustomText = typeof PaymentLinksResourceCustomText.Type
