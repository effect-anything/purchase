import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const DiscountDuration = Schema.Literal("once", "forever", "repeating")
export type DiscountDuration = typeof DiscountDuration.Type
