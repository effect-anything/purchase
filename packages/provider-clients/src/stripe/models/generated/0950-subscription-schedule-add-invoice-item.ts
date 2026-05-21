import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionScheduleAddInvoiceItem = Schema.Struct({
  discounts: Schema.Array(
    Schema.suspend(
      (): Schema.Schema<Models.DiscountsResourceStackableDiscountWithDiscountEnd, any, any> =>
        Models.DiscountsResourceStackableDiscountWithDiscountEnd as Schema.Schema<
          Models.DiscountsResourceStackableDiscountWithDiscountEnd,
          any,
          any
        >
    )
  ),
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  period: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionScheduleAddInvoiceItemPeriod, any, any> =>
      Models.SubscriptionScheduleAddInvoiceItemPeriod as Schema.Schema<
        Models.SubscriptionScheduleAddInvoiceItemPeriod,
        any,
        any
      >
  ),
  price: Schema.Union(
    Schema.String,
    Schema.suspend((): Schema.Schema<Models.Price, any, any> => Models.Price as Schema.Schema<Models.Price, any, any>),
    Schema.suspend(
      (): Schema.Schema<Models.DeletedPrice, any, any> =>
        Models.DeletedPrice as Schema.Schema<Models.DeletedPrice, any, any>
    )
  ),
  quantity: Schema.NullOr(Schema.Number),
  tax_rates: Schema.optional(
    Schema.NullOr(
      Schema.Array(
        Schema.suspend(
          (): Schema.Schema<Models.TaxRate, any, any> => Models.TaxRate as Schema.Schema<Models.TaxRate, any, any>
        )
      )
    )
  )
})
export type SubscriptionScheduleAddInvoiceItem = typeof SubscriptionScheduleAddInvoiceItem.Type
