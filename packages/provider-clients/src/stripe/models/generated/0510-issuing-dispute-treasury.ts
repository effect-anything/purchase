import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingDisputeTreasury = Schema.Struct({
  debit_reversal: Schema.NullOr(Schema.String),
  received_debit: Schema.String
})
export type IssuingDisputeTreasury = typeof IssuingDisputeTreasury.Type
