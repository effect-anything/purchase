import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodKlarna = Schema.Struct({
  dob: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.PaymentFlowsPrivatePaymentMethodsKlarnaDob => Models.PaymentFlowsPrivatePaymentMethodsKlarnaDob))),
})
export type PaymentMethodKlarna = typeof PaymentMethodKlarna.Type
