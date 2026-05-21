import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsPaymentRecordAfterpayClearpay = Schema.Struct({
  order_id: Schema.NullOr(Schema.String),
  reference: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsPaymentRecordAfterpayClearpay =
  typeof PaymentMethodDetailsPaymentRecordAfterpayClearpay.Type
