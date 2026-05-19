import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const InvoicesResourceFromInvoice = Schema.Struct({
  action: Schema.String,
  invoice: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Invoice => Models.Invoice)),
})
export type InvoicesResourceFromInvoice = typeof InvoicesResourceFromInvoice.Type
