import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingTransactionTreasury = Schema.Struct({
  received_credit: Schema.NullOr(Schema.String),
  received_debit: Schema.NullOr(Schema.String),
})
export type IssuingTransactionTreasury = typeof IssuingTransactionTreasury.Type
