import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const InvoicePayment = Schema.Struct({
  amount_paid: Schema.NullOr(Schema.Number),
  amount_requested: Schema.Number,
  created: Schema.Number,
  currency: Schema.String,
  id: Schema.String,
  invoice: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Invoice => Models.Invoice), Schema.suspend((): typeof Models.DeletedInvoice => Models.DeletedInvoice)),
  is_default: Schema.Boolean,
  livemode: Schema.Boolean,
  object: Schema.Literal("invoice_payment"),
  payment: Schema.suspend((): typeof Models.InvoicesPaymentsInvoicePaymentAssociatedPayment => Models.InvoicesPaymentsInvoicePaymentAssociatedPayment),
  status: Schema.String,
  status_transitions: Schema.suspend((): typeof Models.InvoicesPaymentsInvoicePaymentStatusTransitions => Models.InvoicesPaymentsInvoicePaymentStatusTransitions),
})
export type InvoicePayment = typeof InvoicePayment.Type
