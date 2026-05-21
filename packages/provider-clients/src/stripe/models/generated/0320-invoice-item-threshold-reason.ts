import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const InvoiceItemThresholdReason = Schema.Struct({
  line_item_ids: Schema.Array(Schema.String),
  usage_gte: Schema.Number
})
export type InvoiceItemThresholdReason = typeof InvoiceItemThresholdReason.Type
