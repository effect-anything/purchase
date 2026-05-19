import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ReserveTransaction = Schema.Struct({
  amount: Schema.Number,
  currency: Schema.String,
  description: Schema.NullOr(Schema.String),
  id: Schema.String,
  object: Schema.Literal("reserve_transaction"),
})
export type ReserveTransaction = typeof ReserveTransaction.Type
