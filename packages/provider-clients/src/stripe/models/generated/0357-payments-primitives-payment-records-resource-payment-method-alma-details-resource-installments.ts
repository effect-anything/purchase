import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentsPrimitivesPaymentRecordsResourcePaymentMethodAlmaDetailsResourceInstallments = Schema.Struct({
  count: Schema.NullOr(Schema.Number)
})
export type PaymentsPrimitivesPaymentRecordsResourcePaymentMethodAlmaDetailsResourceInstallments =
  typeof PaymentsPrimitivesPaymentRecordsResourcePaymentMethodAlmaDetailsResourceInstallments.Type
