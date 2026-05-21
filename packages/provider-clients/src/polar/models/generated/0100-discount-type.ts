import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DiscountType = Schema.Literal("fixed", "percentage")
export type DiscountType = typeof DiscountType.Type
