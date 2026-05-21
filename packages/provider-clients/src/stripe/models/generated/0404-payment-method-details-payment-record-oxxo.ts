import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsPaymentRecordOxxo = Schema.Struct({
  number: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsPaymentRecordOxxo = typeof PaymentMethodDetailsPaymentRecordOxxo.Type
