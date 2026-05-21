import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BillingBillResourceInvoicingLinesCommonProrationDetails = Schema.Struct({
  credited_items: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.BillingBillResourceInvoicingLinesCommonCreditedItems, any, any> =>
        Models.BillingBillResourceInvoicingLinesCommonCreditedItems as Schema.Schema<
          Models.BillingBillResourceInvoicingLinesCommonCreditedItems,
          any,
          any
        >
    )
  )
})
export type BillingBillResourceInvoicingLinesCommonProrationDetails =
  typeof BillingBillResourceInvoicingLinesCommonProrationDetails.Type
