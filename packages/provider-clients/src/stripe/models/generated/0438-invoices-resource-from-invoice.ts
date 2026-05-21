import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type InvoicesResourceFromInvoice = {
  readonly action: string
  readonly invoice: string | Models.Invoice
}

export const InvoicesResourceFromInvoice = Schema.Struct({
  action: Schema.String,
  invoice: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.Invoice, any, any> => Models.Invoice as Schema.Schema<Models.Invoice, any, any>
    )
  )
})
