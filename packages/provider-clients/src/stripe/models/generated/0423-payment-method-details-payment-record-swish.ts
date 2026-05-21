import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsPaymentRecordSwish = Schema.Struct({
  fingerprint: Schema.NullOr(Schema.String),
  payment_reference: Schema.NullOr(Schema.String),
  verified_phone_last4: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsPaymentRecordSwish = typeof PaymentMethodDetailsPaymentRecordSwish.Type
