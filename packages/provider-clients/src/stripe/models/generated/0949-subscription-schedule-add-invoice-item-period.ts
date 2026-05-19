import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionScheduleAddInvoiceItemPeriod = Schema.Struct({
  end: Schema.suspend((): typeof Models.SubscriptionSchedulesResourceInvoiceItemPeriodResourcePeriodEnd => Models.SubscriptionSchedulesResourceInvoiceItemPeriodResourcePeriodEnd),
  start: Schema.suspend((): typeof Models.SubscriptionSchedulesResourceInvoiceItemPeriodResourcePeriodStart => Models.SubscriptionSchedulesResourceInvoiceItemPeriodResourcePeriodStart),
})
export type SubscriptionScheduleAddInvoiceItemPeriod = typeof SubscriptionScheduleAddInvoiceItemPeriod.Type
