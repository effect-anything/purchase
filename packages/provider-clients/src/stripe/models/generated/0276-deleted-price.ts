import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DeletedPrice = Schema.Struct({
  deleted: Schema.Literal(true),
  id: Schema.String,
  object: Schema.Literal("price")
})
export type DeletedPrice = typeof DeletedPrice.Type
