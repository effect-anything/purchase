import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const InvoiceLineItemPeriod = Schema.Struct({
  end: Schema.Number,
  start: Schema.Number
})
export type InvoiceLineItemPeriod = typeof InvoiceLineItemPeriod.Type
