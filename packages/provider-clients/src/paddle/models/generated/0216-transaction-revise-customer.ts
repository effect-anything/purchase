import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionReviseCustomer = Schema.Struct({
  name: Schema.optional(Schema.suspend((): Schema.Schema<Models.Name> => Models.Name))
})
export type TransactionReviseCustomer = typeof TransactionReviseCustomer.Type
