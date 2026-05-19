import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionSchedulesResourceInvoiceItemPeriodResourcePeriodEnd = Schema.Struct({
  timestamp: Schema.optional(Schema.Number),
  type: Schema.Literal("min_item_period_end", "phase_end", "timestamp"),
})
export type SubscriptionSchedulesResourceInvoiceItemPeriodResourcePeriodEnd = typeof SubscriptionSchedulesResourceInvoiceItemPeriodResourcePeriodEnd.Type
