import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionReviseCustomer = Schema.Struct({
  name: Schema.optional(
    Schema.suspend((): Schema.Schema<Models.Name, any, any> => Models.Name as Schema.Schema<Models.Name, any, any>)
  )
})
export type TransactionReviseCustomer = typeof TransactionReviseCustomer.Type
