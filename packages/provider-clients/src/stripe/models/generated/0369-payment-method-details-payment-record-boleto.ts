import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsPaymentRecordBoleto = Schema.Struct({
  tax_id: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsPaymentRecordBoleto = typeof PaymentMethodDetailsPaymentRecordBoleto.Type
