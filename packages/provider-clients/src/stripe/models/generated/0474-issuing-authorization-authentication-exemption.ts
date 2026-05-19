import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingAuthorizationAuthenticationExemption = Schema.Struct({
  claimed_by: Schema.Literal("acquirer", "issuer"),
  type: Schema.Literal("low_value_transaction", "transaction_risk_analysis", "unknown"),
})
export type IssuingAuthorizationAuthenticationExemption = typeof IssuingAuthorizationAuthenticationExemption.Type
