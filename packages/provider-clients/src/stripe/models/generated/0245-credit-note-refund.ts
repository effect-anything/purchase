import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CreditNoteRefund = Schema.Struct({
  amount_refunded: Schema.Number,
  payment_record_refund: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.CreditNotesPaymentRecordRefund, any, any> =>
        Models.CreditNotesPaymentRecordRefund as Schema.Schema<Models.CreditNotesPaymentRecordRefund, any, any>
    )
  ),
  refund: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Refund, any, any> => Models.Refund as Schema.Schema<Models.Refund, any, any>
    )
  ),
  type: Schema.NullOr(Schema.Literal("payment_record_refund", "refund"))
})
export type CreditNoteRefund = typeof CreditNoteRefund.Type
