import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionReviseBusiness = Schema.Struct({
  name: Schema.optional(
    Schema.suspend((): Schema.Schema<Models.Name, any, any> => Models.Name as Schema.Schema<Models.Name, any, any>)
  ),
  tax_identifier: Schema.optional(Schema.String)
})
export type TransactionReviseBusiness = typeof TransactionReviseBusiness.Type
