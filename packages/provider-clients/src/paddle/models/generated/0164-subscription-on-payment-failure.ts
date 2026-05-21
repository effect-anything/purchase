import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionOnPaymentFailure = Schema.Literal("prevent_change", "apply_change")
export type SubscriptionOnPaymentFailure = typeof SubscriptionOnPaymentFailure.Type
