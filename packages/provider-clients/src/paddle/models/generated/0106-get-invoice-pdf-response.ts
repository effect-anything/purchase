import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const GetInvoicePdfResponse = Schema.Struct({
  meta: Schema.suspend((): Schema.Schema<Models.Meta> => Models.Meta),
  data: Schema.suspend((): Schema.Schema<Models.GetInvoicePdf> => Models.GetInvoicePdf)
})
export type GetInvoicePdfResponse = typeof GetInvoicePdfResponse.Type
