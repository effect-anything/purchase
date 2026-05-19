import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const DeletedCard = Schema.Struct({
  currency: Schema.optional(Schema.NullOr(Schema.String)),
  deleted: Schema.Literal(true),
  id: Schema.String,
  object: Schema.Literal("card"),
})
export type DeletedCard = typeof DeletedCard.Type
