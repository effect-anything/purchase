import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionIndividualName = Schema.Struct({
  enabled: Schema.Boolean,
  optional: Schema.Boolean,
})
export type PaymentPagesCheckoutSessionIndividualName = typeof PaymentPagesCheckoutSessionIndividualName.Type
