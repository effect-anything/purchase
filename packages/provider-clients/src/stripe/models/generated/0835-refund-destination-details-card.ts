import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const RefundDestinationDetailsCard = Schema.Struct({
  reference: Schema.optional(Schema.String),
  reference_status: Schema.optional(Schema.String),
  reference_type: Schema.optional(Schema.String),
  type: Schema.Literal("pending", "refund", "reversal"),
})
export type RefundDestinationDetailsCard = typeof RefundDestinationDetailsCard.Type
