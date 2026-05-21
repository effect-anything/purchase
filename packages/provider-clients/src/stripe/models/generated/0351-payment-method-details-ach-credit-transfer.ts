import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsAchCreditTransfer = Schema.Struct({
  account_number: Schema.NullOr(Schema.String),
  bank_name: Schema.NullOr(Schema.String),
  routing_number: Schema.NullOr(Schema.String),
  swift_code: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsAchCreditTransfer = typeof PaymentMethodDetailsAchCreditTransfer.Type
