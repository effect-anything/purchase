import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const InvoiceThresholdReason = Schema.Struct({
  amount_gte: Schema.NullOr(Schema.Number),
  item_reasons: Schema.Array(Schema.suspend((): typeof Models.InvoiceItemThresholdReason => Models.InvoiceItemThresholdReason)),
})
export type InvoiceThresholdReason = typeof InvoiceThresholdReason.Type
