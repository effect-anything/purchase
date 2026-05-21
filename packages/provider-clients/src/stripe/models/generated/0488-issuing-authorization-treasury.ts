import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingAuthorizationTreasury = Schema.Struct({
  received_credits: Schema.Array(Schema.String),
  received_debits: Schema.Array(Schema.String),
  transaction: Schema.NullOr(Schema.String)
})
export type IssuingAuthorizationTreasury = typeof IssuingAuthorizationTreasury.Type
