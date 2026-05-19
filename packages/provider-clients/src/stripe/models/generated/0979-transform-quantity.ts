import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransformQuantity = Schema.Struct({
  divide_by: Schema.Number,
  round: Schema.Literal("down", "up"),
})
export type TransformQuantity = typeof TransformQuantity.Type
