import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceInstallments = Schema.Struct({
  plan: Schema.NullOr(Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceInstallmentPlan => Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceInstallmentPlan)),
})
export type PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceInstallments = typeof PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceInstallments.Type
