import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DeletedTaxId = Schema.Struct({
  deleted: Schema.Literal(true),
  id: Schema.String,
  object: Schema.Literal("tax_id")
})
export type DeletedTaxId = typeof DeletedTaxId.Type
