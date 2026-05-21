import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsPaymentRecordBillie = Schema.Struct({
  transaction_id: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsPaymentRecordBillie = typeof PaymentMethodDetailsPaymentRecordBillie.Type
