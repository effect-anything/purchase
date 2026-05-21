import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DeletedCustomer = Schema.Struct({
  deleted: Schema.Literal(true),
  id: Schema.String,
  object: Schema.Literal("customer")
})
export type DeletedCustomer = typeof DeletedCustomer.Type
