import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsPaymentRecordBlik = Schema.Struct({
  buyer_id: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsPaymentRecordBlik = typeof PaymentMethodDetailsPaymentRecordBlik.Type
