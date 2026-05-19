import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransactionReviseCustomer = Schema.Struct({
  name: Schema.optional(Schema.suspend(() => Models.Name)),
})
export type TransactionReviseCustomer = typeof TransactionReviseCustomer.Type
