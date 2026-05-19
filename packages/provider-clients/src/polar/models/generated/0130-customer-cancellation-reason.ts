import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CustomerCancellationReason = Schema.Literal("customer_service", "low_quality", "missing_features", "switched_service", "too_complex", "too_expensive", "unused", "other")
export type CustomerCancellationReason = typeof CustomerCancellationReason.Type
