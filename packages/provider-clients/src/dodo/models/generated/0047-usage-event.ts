import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const UsageEvent = Schema.Struct({
  event_id: Schema.String,
  customer_id: Schema.String,
  event_name: Schema.String,
  timestamp: Schema.String,
  metadata: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.String }))
})
export type UsageEvent = typeof UsageEvent.Type
