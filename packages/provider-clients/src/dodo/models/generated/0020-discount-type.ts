import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const DiscountType = Schema.Literal("percentage")
export type DiscountType = typeof DiscountType.Type
