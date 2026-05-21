import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentsPrimitivesPaymentRecordsResourceShippingDetails = Schema.Struct({
  address: Schema.suspend(
    (): Schema.Schema<Models.PaymentsPrimitivesPaymentRecordsResourceAddress, any, any> =>
      Models.PaymentsPrimitivesPaymentRecordsResourceAddress as Schema.Schema<
        Models.PaymentsPrimitivesPaymentRecordsResourceAddress,
        any,
        any
      >
  ),
  name: Schema.NullOr(Schema.String),
  phone: Schema.NullOr(Schema.String)
})
export type PaymentsPrimitivesPaymentRecordsResourceShippingDetails =
  typeof PaymentsPrimitivesPaymentRecordsResourceShippingDetails.Type
