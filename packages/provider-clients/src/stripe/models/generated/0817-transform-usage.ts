import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const TransformUsage = Schema.Struct({
  divide_by: Schema.Number,
  round: Schema.Literal("down", "up"),
})
export type TransformUsage = typeof TransformUsage.Type
