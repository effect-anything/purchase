import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const DiscountMode = Schema.Literal("standard", "custom")
export type DiscountMode = typeof DiscountMode.Type
