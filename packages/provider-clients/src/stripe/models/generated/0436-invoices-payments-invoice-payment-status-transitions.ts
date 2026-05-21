import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const InvoicesPaymentsInvoicePaymentStatusTransitions = Schema.Struct({
  canceled_at: Schema.NullOr(Schema.Number),
  paid_at: Schema.NullOr(Schema.Number)
})
export type InvoicesPaymentsInvoicePaymentStatusTransitions =
  typeof InvoicesPaymentsInvoicePaymentStatusTransitions.Type
