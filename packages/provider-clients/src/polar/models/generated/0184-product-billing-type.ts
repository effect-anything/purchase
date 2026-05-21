import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ProductBillingType = Schema.Literal("one_time", "recurring")
export type ProductBillingType = typeof ProductBillingType.Type
