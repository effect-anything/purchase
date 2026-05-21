import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceInstallments = Schema.Struct({
  plan: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceInstallmentPlan,
        any,
        any
      > =>
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceInstallmentPlan as Schema.Schema<
          Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceInstallmentPlan,
          any,
          any
        >
    )
  )
})
export type PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceInstallments =
  typeof PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceInstallments.Type
