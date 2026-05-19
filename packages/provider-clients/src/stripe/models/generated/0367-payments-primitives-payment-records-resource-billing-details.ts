import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentsPrimitivesPaymentRecordsResourceBillingDetails = Schema.Struct({
  address: Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourceAddress => Models.PaymentsPrimitivesPaymentRecordsResourceAddress),
  email: Schema.NullOr(Schema.String),
  name: Schema.NullOr(Schema.String),
  phone: Schema.NullOr(Schema.String),
})
export type PaymentsPrimitivesPaymentRecordsResourceBillingDetails = typeof PaymentsPrimitivesPaymentRecordsResourceBillingDetails.Type
