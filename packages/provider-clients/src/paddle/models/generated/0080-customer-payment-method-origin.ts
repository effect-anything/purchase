import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerPaymentMethodOrigin = Schema.Literal("saved_during_purchase", "subscription", "subscription_saved_during_purchase")
export type CustomerPaymentMethodOrigin = typeof CustomerPaymentMethodOrigin.Type
