import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const InvoicesPaymentsInvoicePaymentAssociatedPayment = Schema.Struct({
  charge: Schema.optional(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Charge, any, any> => Models.Charge as Schema.Schema<Models.Charge, any, any>
      )
    )
  ),
  payment_intent: Schema.optional(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PaymentIntent, any, any> =>
          Models.PaymentIntent as Schema.Schema<Models.PaymentIntent, any, any>
      )
    )
  ),
  payment_record: Schema.optional(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PaymentRecord, any, any> =>
          Models.PaymentRecord as Schema.Schema<Models.PaymentRecord, any, any>
      )
    )
  ),
  type: Schema.Literal("charge", "payment_intent", "payment_record")
})
export type InvoicesPaymentsInvoicePaymentAssociatedPayment =
  typeof InvoicesPaymentsInvoicePaymentAssociatedPayment.Type
