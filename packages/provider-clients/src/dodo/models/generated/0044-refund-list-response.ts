import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const RefundListResponse = Schema.Struct({
  items: Schema.Array(Schema.suspend(() => Models.Refund)),
  total: Schema.optional(Schema.Number),
})
export type RefundListResponse = typeof RefundListResponse.Type
