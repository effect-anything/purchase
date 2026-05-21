import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CreditNotesPaymentRecordRefund = Schema.Struct({
  payment_record: Schema.String,
  refund_group: Schema.String
})
export type CreditNotesPaymentRecordRefund = typeof CreditNotesPaymentRecordRefund.Type
