import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const GetInvoicePdfResponse = Schema.Struct({
  meta: Schema.suspend((): Schema.Schema<Models.Meta, any, any> => Models.Meta as Schema.Schema<Models.Meta, any, any>),
  data: Schema.suspend(
    (): Schema.Schema<Models.GetInvoicePdf, any, any> =>
      Models.GetInvoicePdf as Schema.Schema<Models.GetInvoicePdf, any, any>
  )
})
export type GetInvoicePdfResponse = typeof GetInvoicePdfResponse.Type
