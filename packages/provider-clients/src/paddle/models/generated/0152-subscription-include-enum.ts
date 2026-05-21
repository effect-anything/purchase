import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionIncludeEnum = Schema.Literal("next_transaction", "recurring_transaction_details")
export type SubscriptionIncludeEnum = typeof SubscriptionIncludeEnum.Type
