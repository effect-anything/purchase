import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const RefundDestinationDetailsGbBankTransfer = Schema.Struct({
  reference: Schema.NullOr(Schema.String),
  reference_status: Schema.NullOr(Schema.String),
})
export type RefundDestinationDetailsGbBankTransfer = typeof RefundDestinationDetailsGbBankTransfer.Type
