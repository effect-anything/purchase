import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const InvoiceRenderingPdf = Schema.Struct({
  page_size: Schema.NullOr(Schema.Literal("a4", "auto", "letter"))
})
export type InvoiceRenderingPdf = typeof InvoiceRenderingPdf.Type
