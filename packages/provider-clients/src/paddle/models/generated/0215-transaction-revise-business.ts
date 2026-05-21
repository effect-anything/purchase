import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TransactionReviseBusiness = Schema.Struct({
  name: Schema.optional(Schema.suspend((): Schema.Schema<Models.Name> => Models.Name)),
  tax_identifier: Schema.optional(Schema.String)
})
export type TransactionReviseBusiness = typeof TransactionReviseBusiness.Type
