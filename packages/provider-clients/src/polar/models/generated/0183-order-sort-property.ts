import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const OrderSortProperty = Schema.Literal("created_at", "-created_at", "status", "-status", "invoice_number", "-invoice_number", "amount", "-amount", "net_amount", "-net_amount", "customer", "-customer", "product", "-product", "discount", "-discount", "subscription", "-subscription")
export type OrderSortProperty = typeof OrderSortProperty.Type
