import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentFlowsPrivatePaymentMethodsKlarnaDob = Schema.Struct({
  day: Schema.NullOr(Schema.Number),
  month: Schema.NullOr(Schema.Number),
  year: Schema.NullOr(Schema.Number)
})
export type PaymentFlowsPrivatePaymentMethodsKlarnaDob = typeof PaymentFlowsPrivatePaymentMethodsKlarnaDob.Type
