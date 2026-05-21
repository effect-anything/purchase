import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentsPrimitivesPaymentRecordsResourceCustomerDetails = Schema.Struct({
  customer: Schema.NullOr(Schema.String),
  email: Schema.NullOr(Schema.String),
  name: Schema.NullOr(Schema.String),
  phone: Schema.NullOr(Schema.String)
})
export type PaymentsPrimitivesPaymentRecordsResourceCustomerDetails =
  typeof PaymentsPrimitivesPaymentRecordsResourceCustomerDetails.Type
