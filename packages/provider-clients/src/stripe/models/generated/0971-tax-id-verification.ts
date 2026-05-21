import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const TaxIdVerification = Schema.Struct({
  status: Schema.Literal("pending", "unavailable", "unverified", "verified"),
  verified_address: Schema.NullOr(Schema.String),
  verified_name: Schema.NullOr(Schema.String)
})
export type TaxIdVerification = typeof TaxIdVerification.Type
