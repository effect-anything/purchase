import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodKlarna = Schema.Struct({
  dob: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.PaymentFlowsPrivatePaymentMethodsKlarnaDob, any, any> =>
          Models.PaymentFlowsPrivatePaymentMethodsKlarnaDob as Schema.Schema<
            Models.PaymentFlowsPrivatePaymentMethodsKlarnaDob,
            any,
            any
          >
      )
    )
  )
})
export type PaymentMethodKlarna = typeof PaymentMethodKlarna.Type
