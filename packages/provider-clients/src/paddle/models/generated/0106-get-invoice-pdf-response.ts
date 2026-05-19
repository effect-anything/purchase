import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const GetInvoicePdfResponse = Schema.Struct({
  meta: Schema.suspend(() => Models.Meta),
  data: Schema.suspend(() => Models.GetInvoicePdf),
})
export type GetInvoicePdfResponse = typeof GetInvoicePdfResponse.Type
