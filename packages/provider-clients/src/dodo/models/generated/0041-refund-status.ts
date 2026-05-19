import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const RefundStatus = Schema.Literal("succeeded", "failed", "pending", "review")
export type RefundStatus = typeof RefundStatus.Type
