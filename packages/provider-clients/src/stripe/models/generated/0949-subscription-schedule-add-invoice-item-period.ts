import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionScheduleAddInvoiceItemPeriod = Schema.Struct({
  end: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionSchedulesResourceInvoiceItemPeriodResourcePeriodEnd, any, any> =>
      Models.SubscriptionSchedulesResourceInvoiceItemPeriodResourcePeriodEnd as Schema.Schema<
        Models.SubscriptionSchedulesResourceInvoiceItemPeriodResourcePeriodEnd,
        any,
        any
      >
  ),
  start: Schema.suspend(
    (): Schema.Schema<Models.SubscriptionSchedulesResourceInvoiceItemPeriodResourcePeriodStart, any, any> =>
      Models.SubscriptionSchedulesResourceInvoiceItemPeriodResourcePeriodStart as Schema.Schema<
        Models.SubscriptionSchedulesResourceInvoiceItemPeriodResourcePeriodStart,
        any,
        any
      >
  )
})
export type SubscriptionScheduleAddInvoiceItemPeriod = typeof SubscriptionScheduleAddInvoiceItemPeriod.Type
