import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutStatus = Schema.Literal("open", "expired", "confirmed", "succeeded", "failed")
export type CheckoutStatus = typeof CheckoutStatus.Type
