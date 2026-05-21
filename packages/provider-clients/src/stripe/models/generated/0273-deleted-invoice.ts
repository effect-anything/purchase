import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DeletedInvoice = Schema.Struct({
  deleted: Schema.Literal(true),
  id: Schema.String,
  object: Schema.Literal("invoice")
})
export type DeletedInvoice = typeof DeletedInvoice.Type
