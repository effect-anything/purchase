import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsSepaCreditTransfer = Schema.Struct({
  bank_name: Schema.NullOr(Schema.String),
  bic: Schema.NullOr(Schema.String),
  iban: Schema.NullOr(Schema.String),
})
export type PaymentMethodDetailsSepaCreditTransfer = typeof PaymentMethodDetailsSepaCreditTransfer.Type
