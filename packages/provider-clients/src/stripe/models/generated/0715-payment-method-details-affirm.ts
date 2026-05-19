import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsAffirm = Schema.Struct({
  location: Schema.optional(Schema.String),
  reader: Schema.optional(Schema.String),
  transaction_id: Schema.NullOr(Schema.String),
})
export type PaymentMethodDetailsAffirm = typeof PaymentMethodDetailsAffirm.Type
