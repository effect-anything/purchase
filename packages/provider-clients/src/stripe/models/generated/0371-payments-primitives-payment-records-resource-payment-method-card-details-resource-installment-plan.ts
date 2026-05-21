import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceInstallmentPlan = Schema.Struct({
  count: Schema.NullOr(Schema.Number),
  interval: Schema.NullOr(Schema.Literal("month")),
  type: Schema.Literal("bonus", "fixed_count", "revolving")
})
export type PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceInstallmentPlan =
  typeof PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceInstallmentPlan.Type
