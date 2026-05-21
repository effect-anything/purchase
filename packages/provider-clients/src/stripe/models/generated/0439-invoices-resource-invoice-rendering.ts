import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const InvoicesResourceInvoiceRendering = Schema.Struct({
  amount_tax_display: Schema.NullOr(Schema.String),
  pdf: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.InvoiceRenderingPdf, any, any> =>
        Models.InvoiceRenderingPdf as Schema.Schema<Models.InvoiceRenderingPdf, any, any>
    )
  ),
  template: Schema.NullOr(Schema.String),
  template_version: Schema.NullOr(Schema.Number)
})
export type InvoicesResourceInvoiceRendering = typeof InvoicesResourceInvoiceRendering.Type
