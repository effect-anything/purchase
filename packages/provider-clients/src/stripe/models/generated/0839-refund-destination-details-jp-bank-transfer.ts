import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const RefundDestinationDetailsJpBankTransfer = Schema.Struct({
  reference: Schema.NullOr(Schema.String),
  reference_status: Schema.NullOr(Schema.String),
})
export type RefundDestinationDetailsJpBankTransfer = typeof RefundDestinationDetailsJpBankTransfer.Type
