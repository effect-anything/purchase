import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionReviseAddress = Schema.Struct({
  first_line: Schema.optional(Schema.String),
  second_line: Schema.optional(Schema.NullOr(Schema.String)),
  city: Schema.optional(Schema.String),
  region: Schema.optional(Schema.String),
})
export type TransactionReviseAddress = typeof TransactionReviseAddress.Type
