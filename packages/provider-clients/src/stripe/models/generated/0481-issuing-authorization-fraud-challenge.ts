import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingAuthorizationFraudChallenge = Schema.Struct({
  channel: Schema.Literal("sms"),
  status: Schema.Literal("expired", "pending", "rejected", "undeliverable", "verified"),
  undeliverable_reason: Schema.NullOr(Schema.Literal("no_phone_number", "unsupported_phone_number"))
})
export type IssuingAuthorizationFraudChallenge = typeof IssuingAuthorizationFraudChallenge.Type
