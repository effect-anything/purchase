import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodOptionsCardInstallments = Schema.Struct({
  available_plans: Schema.NullOr(
    Schema.Array(
      Schema.suspend(
        (): Schema.Schema<Models.PaymentMethodDetailsCardInstallmentsPlan, any, any> =>
          Models.PaymentMethodDetailsCardInstallmentsPlan as Schema.Schema<
            Models.PaymentMethodDetailsCardInstallmentsPlan,
            any,
            any
          >
      )
    )
  ),
  enabled: Schema.Boolean,
  plan: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsCardInstallmentsPlan, any, any> =>
        Models.PaymentMethodDetailsCardInstallmentsPlan as Schema.Schema<
          Models.PaymentMethodDetailsCardInstallmentsPlan,
          any,
          any
        >
    )
  )
})
export type PaymentMethodOptionsCardInstallments = typeof PaymentMethodOptionsCardInstallments.Type
