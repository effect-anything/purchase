import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionCheckout = Schema.Struct({
  url: Schema.NullOr(Schema.String),
})
export type TransactionCheckout = typeof TransactionCheckout.Type
