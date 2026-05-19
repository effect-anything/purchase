import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const EffectiveFromImmediately = Schema.Literal("immediately")
export type EffectiveFromImmediately = typeof EffectiveFromImmediately.Type
