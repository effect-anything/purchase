import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodBacsDebit = Schema.Struct({
  fingerprint: Schema.NullOr(Schema.String),
  last4: Schema.NullOr(Schema.String),
  sort_code: Schema.NullOr(Schema.String)
})
export type PaymentMethodBacsDebit = typeof PaymentMethodBacsDebit.Type
