import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const RefundNextAction = Schema.Struct({
  display_details: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.RefundNextActionDisplayDetails, any, any> =>
        Models.RefundNextActionDisplayDetails as Schema.Schema<Models.RefundNextActionDisplayDetails, any, any>
    )
  ),
  type: Schema.String
})
export type RefundNextAction = typeof RefundNextAction.Type
