import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionScheduleAddInvoiceItem = Schema.Struct({
  discounts: Schema.Array(Schema.suspend((): typeof Models.DiscountsResourceStackableDiscountWithDiscountEnd => Models.DiscountsResourceStackableDiscountWithDiscountEnd)),
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  period: Schema.suspend((): typeof Models.SubscriptionScheduleAddInvoiceItemPeriod => Models.SubscriptionScheduleAddInvoiceItemPeriod),
  price: Schema.Union(Schema.String, Schema.suspend((): typeof Models.Price => Models.Price), Schema.suspend((): typeof Models.DeletedPrice => Models.DeletedPrice)),
  quantity: Schema.NullOr(Schema.Number),
  tax_rates: Schema.optional(Schema.NullOr(Schema.Array(Schema.suspend((): typeof Models.TaxRate => Models.TaxRate)))),
})
export type SubscriptionScheduleAddInvoiceItem = typeof SubscriptionScheduleAddInvoiceItem.Type
