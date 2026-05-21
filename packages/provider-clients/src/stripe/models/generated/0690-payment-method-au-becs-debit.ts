import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodAuBecsDebit = Schema.Struct({
  bsb_number: Schema.NullOr(Schema.String),
  fingerprint: Schema.NullOr(Schema.String),
  last4: Schema.NullOr(Schema.String)
})
export type PaymentMethodAuBecsDebit = typeof PaymentMethodAuBecsDebit.Type
