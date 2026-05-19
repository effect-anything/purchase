import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const InvoicesPaymentsInvoicePaymentAssociatedPayment = Schema.Struct({
  charge: Schema.optional(Schema.Union(Schema.String, Schema.suspend((): typeof Models.Charge => Models.Charge))),
  payment_intent: Schema.optional(Schema.Union(Schema.String, Schema.suspend((): typeof Models.PaymentIntent => Models.PaymentIntent))),
  payment_record: Schema.optional(Schema.Union(Schema.String, Schema.suspend((): typeof Models.PaymentRecord => Models.PaymentRecord))),
  type: Schema.Literal("charge", "payment_intent", "payment_record"),
})
export type InvoicesPaymentsInvoicePaymentAssociatedPayment = typeof InvoicesPaymentsInvoicePaymentAssociatedPayment.Type
