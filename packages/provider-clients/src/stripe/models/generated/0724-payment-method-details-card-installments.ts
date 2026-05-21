import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsCardInstallments = Schema.Struct({
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
export type PaymentMethodDetailsCardInstallments = typeof PaymentMethodDetailsCardInstallments.Type
