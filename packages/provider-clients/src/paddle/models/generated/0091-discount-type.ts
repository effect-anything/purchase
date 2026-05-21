import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DiscountType = Schema.Literal("flat", "flat_per_seat", "percentage")
export type DiscountType = typeof DiscountType.Type
