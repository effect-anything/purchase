import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingAuthorizationVerificationData = Schema.Struct({
  address_line1_check: Schema.Literal("match", "mismatch", "not_provided"),
  address_postal_code_check: Schema.Literal("match", "mismatch", "not_provided"),
  authentication_exemption: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingAuthorizationAuthenticationExemption, any, any> =>
        Models.IssuingAuthorizationAuthenticationExemption as Schema.Schema<
          Models.IssuingAuthorizationAuthenticationExemption,
          any,
          any
        >
    )
  ),
  cvc_check: Schema.Literal("match", "mismatch", "not_provided"),
  expiry_check: Schema.Literal("match", "mismatch", "not_provided"),
  postal_code: Schema.NullOr(Schema.String),
  three_d_secure: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingAuthorizationThreeDSecure, any, any> =>
        Models.IssuingAuthorizationThreeDSecure as Schema.Schema<Models.IssuingAuthorizationThreeDSecure, any, any>
    )
  )
})
export type IssuingAuthorizationVerificationData = typeof IssuingAuthorizationVerificationData.Type
