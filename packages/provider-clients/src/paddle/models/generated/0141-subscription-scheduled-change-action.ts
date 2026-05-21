import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionScheduledChangeAction = Schema.Literal("cancel", "pause", "resume")
export type SubscriptionScheduledChangeAction = typeof SubscriptionScheduledChangeAction.Type
