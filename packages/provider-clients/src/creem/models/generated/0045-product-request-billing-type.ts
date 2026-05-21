import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductRequestBillingType = Schema.Literal("recurring", "onetime")
export type ProductRequestBillingType = typeof ProductRequestBillingType.Type
