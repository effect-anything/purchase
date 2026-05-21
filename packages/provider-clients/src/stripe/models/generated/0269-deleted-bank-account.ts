import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DeletedBankAccount = Schema.Struct({
  currency: Schema.optional(Schema.NullOr(Schema.String)),
  deleted: Schema.Literal(true),
  id: Schema.String,
  object: Schema.Literal("bank_account")
})
export type DeletedBankAccount = typeof DeletedBankAccount.Type
