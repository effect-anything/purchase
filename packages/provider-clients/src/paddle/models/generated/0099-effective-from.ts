import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const EffectiveFrom = Schema.Literal("next_billing_period", "immediately")
export type EffectiveFrom = typeof EffectiveFrom.Type
