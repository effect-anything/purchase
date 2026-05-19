import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CreditNoteRefund = Schema.Struct({
  amount_refunded: Schema.Number,
  payment_record_refund: Schema.NullOr(Schema.suspend((): typeof Models.CreditNotesPaymentRecordRefund => Models.CreditNotesPaymentRecordRefund)),
  refund: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Refund => Models.Refund)),
  type: Schema.NullOr(Schema.Literal("payment_record_refund", "refund")),
})
export type CreditNoteRefund = typeof CreditNoteRefund.Type
