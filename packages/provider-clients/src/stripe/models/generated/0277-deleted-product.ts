import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DeletedProduct = Schema.Struct({
  deleted: Schema.Literal(true),
  id: Schema.String,
  object: Schema.Literal("product")
})
export type DeletedProduct = typeof DeletedProduct.Type
