import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionSchedulesResourceInvoiceItemPeriodResourcePeriodStart = Schema.Struct({
  timestamp: Schema.optional(Schema.Number),
  type: Schema.Literal("max_item_period_start", "phase_start", "timestamp")
})
export type SubscriptionSchedulesResourceInvoiceItemPeriodResourcePeriodStart =
  typeof SubscriptionSchedulesResourceInvoiceItemPeriodResourcePeriodStart.Type
