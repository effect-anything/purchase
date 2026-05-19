import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CheckoutLinkSortProperty = Schema.Literal("created_at", "-created_at", "label", "-label", "success_url", "-success_url", "allow_discount_codes", "-allow_discount_codes")
export type CheckoutLinkSortProperty = typeof CheckoutLinkSortProperty.Type
