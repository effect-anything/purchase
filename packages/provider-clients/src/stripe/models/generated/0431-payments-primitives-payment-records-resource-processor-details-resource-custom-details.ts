import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentsPrimitivesPaymentRecordsResourceProcessorDetailsResourceCustomDetails = Schema.Struct({
  payment_reference: Schema.NullOr(Schema.String)
})
export type PaymentsPrimitivesPaymentRecordsResourceProcessorDetailsResourceCustomDetails =
  typeof PaymentsPrimitivesPaymentRecordsResourceProcessorDetailsResourceCustomDetails.Type
