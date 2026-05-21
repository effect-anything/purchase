import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const RefundListResponse = Schema.Struct({
  items: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.Refund, any, any> => Models.Refund as Schema.Schema<Models.Refund, any, any>
    )
  ),
  total: Schema.optional(Schema.Number)
})
export type RefundListResponse = typeof RefundListResponse.Type
