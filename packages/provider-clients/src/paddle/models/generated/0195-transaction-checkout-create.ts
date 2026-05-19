import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionCheckoutCreate = Schema.Struct({
  url: Schema.optional(Schema.NullOr(Schema.String)),
})
export type TransactionCheckoutCreate = typeof TransactionCheckoutCreate.Type
