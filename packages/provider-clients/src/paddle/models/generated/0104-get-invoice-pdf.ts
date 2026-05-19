import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const GetInvoicePdf = Schema.Struct({
  url: Schema.String,
})
export type GetInvoicePdf = typeof GetInvoicePdf.Type
