import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type BillingCreditGrantsResourceBalanceCreditsApplicationInvoiceVoided = {
  readonly invoice: string | Models.Invoice
  readonly invoice_line_item: string
}

export const BillingCreditGrantsResourceBalanceCreditsApplicationInvoiceVoided = Schema.Struct({
  invoice: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Invoice, any, any> => Models.Invoice as Schema.Schema<Models.Invoice, any, any>
    )
  ),
  invoice_line_item: Schema.String
})
