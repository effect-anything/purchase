import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingAuthorizationThreeDSecure = Schema.Struct({
  result: Schema.Literal("attempt_acknowledged", "authenticated", "failed", "required"),
})
export type IssuingAuthorizationThreeDSecure = typeof IssuingAuthorizationThreeDSecure.Type
