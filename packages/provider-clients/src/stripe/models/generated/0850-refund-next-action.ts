import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const RefundNextAction = Schema.Struct({
  display_details: Schema.optional(Schema.suspend((): typeof Models.RefundNextActionDisplayDetails => Models.RefundNextActionDisplayDetails)),
  type: Schema.String,
})
export type RefundNextAction = typeof RefundNextAction.Type
