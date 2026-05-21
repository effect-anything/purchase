import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCustomDetails = Schema.Struct({
  display_name: Schema.String,
  type: Schema.NullOr(Schema.String)
})
export type PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCustomDetails =
  typeof PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCustomDetails.Type
