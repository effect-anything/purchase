import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ThreeDSecureUsage = Schema.Struct({
  supported: Schema.Boolean,
})
export type ThreeDSecureUsage = typeof ThreeDSecureUsage.Type
