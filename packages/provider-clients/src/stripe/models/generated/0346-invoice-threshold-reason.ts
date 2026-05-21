import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const InvoiceThresholdReason = Schema.Struct({
  amount_gte: Schema.NullOr(Schema.Number),
  item_reasons: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.InvoiceItemThresholdReason, any, any> =>
        Models.InvoiceItemThresholdReason as Schema.Schema<Models.InvoiceItemThresholdReason, any, any>
    )
  )
})
export type InvoiceThresholdReason = typeof InvoiceThresholdReason.Type
