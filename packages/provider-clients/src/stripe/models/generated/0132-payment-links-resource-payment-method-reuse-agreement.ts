import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentLinksResourcePaymentMethodReuseAgreement = Schema.Struct({
  position: Schema.Literal("auto", "hidden")
})
export type PaymentLinksResourcePaymentMethodReuseAgreement =
  typeof PaymentLinksResourcePaymentMethodReuseAgreement.Type
