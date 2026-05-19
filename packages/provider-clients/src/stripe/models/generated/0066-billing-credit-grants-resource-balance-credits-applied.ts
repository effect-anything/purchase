import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const BillingCreditGrantsResourceBalanceCreditsApplied = Schema.Struct({
  invoice: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Invoice => Models.Invoice)),
  invoice_line_item: Schema.String,
})
export type BillingCreditGrantsResourceBalanceCreditsApplied = typeof BillingCreditGrantsResourceBalanceCreditsApplied.Type
