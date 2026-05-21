import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionOnResume = Schema.Literal("continue_existing_billing_period", "start_new_billing_period")
export type SubscriptionOnResume = typeof SubscriptionOnResume.Type
