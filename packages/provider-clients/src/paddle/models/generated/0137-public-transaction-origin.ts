import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PublicTransactionOrigin = Schema.Literal("api", "subscription_charge", "subscription_payment_method_change", "subscription_recurring", "subscription_update", "web")
export type PublicTransactionOrigin = typeof PublicTransactionOrigin.Type
