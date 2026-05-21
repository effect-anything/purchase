import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentsPrimitivesPaymentRecordsResourceAmount = Schema.Struct({
  currency: Schema.String,
  value: Schema.Number
})
export type PaymentsPrimitivesPaymentRecordsResourceAmount = typeof PaymentsPrimitivesPaymentRecordsResourceAmount.Type
