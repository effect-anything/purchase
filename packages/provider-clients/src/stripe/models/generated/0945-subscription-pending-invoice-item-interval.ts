import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionPendingInvoiceItemInterval = Schema.Struct({
  interval: Schema.Literal("day", "month", "week", "year"),
  interval_count: Schema.Number
})
export type SubscriptionPendingInvoiceItemInterval = typeof SubscriptionPendingInvoiceItemInterval.Type
