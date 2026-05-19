import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingAuthorizationVerificationData = Schema.Struct({
  address_line1_check: Schema.Literal("match", "mismatch", "not_provided"),
  address_postal_code_check: Schema.Literal("match", "mismatch", "not_provided"),
  authentication_exemption: Schema.NullOr(Schema.suspend((): typeof Models.IssuingAuthorizationAuthenticationExemption => Models.IssuingAuthorizationAuthenticationExemption)),
  cvc_check: Schema.Literal("match", "mismatch", "not_provided"),
  expiry_check: Schema.Literal("match", "mismatch", "not_provided"),
  postal_code: Schema.NullOr(Schema.String),
  three_d_secure: Schema.NullOr(Schema.suspend((): typeof Models.IssuingAuthorizationThreeDSecure => Models.IssuingAuthorizationThreeDSecure)),
})
export type IssuingAuthorizationVerificationData = typeof IssuingAuthorizationVerificationData.Type
