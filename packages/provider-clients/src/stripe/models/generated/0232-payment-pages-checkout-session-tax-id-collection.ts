import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionTaxIdCollection = Schema.Struct({
  enabled: Schema.Boolean,
  required: Schema.Literal("if_supported", "never")
})
export type PaymentPagesCheckoutSessionTaxIdCollection = typeof PaymentPagesCheckoutSessionTaxIdCollection.Type
