import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionUpdateClear = Schema.Struct({
  pending_update: Schema.Unknown
})
export type SubscriptionUpdateClear = typeof SubscriptionUpdateClear.Type
