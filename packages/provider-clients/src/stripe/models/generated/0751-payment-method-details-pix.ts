import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsPix = Schema.Struct({
  bank_transaction_id: Schema.optional(Schema.NullOr(Schema.String)),
  mandate: Schema.optional(Schema.String),
})
export type PaymentMethodDetailsPix = typeof PaymentMethodDetailsPix.Type
