import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionConsent = Schema.Struct({
  promotions: Schema.NullOr(Schema.Literal("opt_in", "opt_out")),
  terms_of_service: Schema.NullOr(Schema.Literal("accepted"))
})
export type PaymentPagesCheckoutSessionConsent = typeof PaymentPagesCheckoutSessionConsent.Type
