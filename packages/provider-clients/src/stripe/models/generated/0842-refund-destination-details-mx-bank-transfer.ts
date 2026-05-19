import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const RefundDestinationDetailsMxBankTransfer = Schema.Struct({
  reference: Schema.NullOr(Schema.String),
  reference_status: Schema.NullOr(Schema.String),
})
export type RefundDestinationDetailsMxBankTransfer = typeof RefundDestinationDetailsMxBankTransfer.Type
