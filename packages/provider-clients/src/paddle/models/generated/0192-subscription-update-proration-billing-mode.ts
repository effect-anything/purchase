import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SubscriptionUpdateProrationBillingMode = Schema.Literal("prorated_immediately", "prorated_next_billing_period", "full_immediately", "full_next_billing_period", "do_not_bill")
export type SubscriptionUpdateProrationBillingMode = typeof SubscriptionUpdateProrationBillingMode.Type
