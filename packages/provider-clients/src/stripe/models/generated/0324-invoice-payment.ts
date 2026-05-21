import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type InvoicePayment = {
  readonly amount_paid: number | null
  readonly amount_requested: number
  readonly created: number
  readonly currency: string
  readonly id: string
  readonly invoice: string | Models.Invoice | Models.DeletedInvoice
  readonly is_default: boolean
  readonly livemode: boolean
  readonly object: "invoice_payment"
  readonly payment: Models.InvoicesPaymentsInvoicePaymentAssociatedPayment
  readonly status: string
  readonly status_transitions: Models.InvoicesPaymentsInvoicePaymentStatusTransitions
}

export const InvoicePayment = Schema.Struct({
  amount_paid: Schema.NullOr(Schema.Number),
  amount_requested: Schema.Number,
  created: Schema.Number,
  currency: Schema.String,
  id: Schema.String,
  invoice: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Invoice, any, any> => Models.Invoice as Schema.Schema<Models.Invoice, any, any>
    ),
    Schema.suspend(
      (): Schema.Schema<Models.DeletedInvoice, any, any> =>
        Models.DeletedInvoice as Schema.Schema<Models.DeletedInvoice, any, any>
    )
  ),
  is_default: Schema.Boolean,
  livemode: Schema.Boolean,
  object: Schema.Literal("invoice_payment"),
  payment: Schema.suspend(
    (): Schema.Schema<Models.InvoicesPaymentsInvoicePaymentAssociatedPayment, any, any> =>
      Models.InvoicesPaymentsInvoicePaymentAssociatedPayment as Schema.Schema<
        Models.InvoicesPaymentsInvoicePaymentAssociatedPayment,
        any,
        any
      >
  ),
  status: Schema.String,
  status_transitions: Schema.suspend(
    (): Schema.Schema<Models.InvoicesPaymentsInvoicePaymentStatusTransitions, any, any> =>
      Models.InvoicesPaymentsInvoicePaymentStatusTransitions as Schema.Schema<
        Models.InvoicesPaymentsInvoicePaymentStatusTransitions,
        any,
        any
      >
  )
})
