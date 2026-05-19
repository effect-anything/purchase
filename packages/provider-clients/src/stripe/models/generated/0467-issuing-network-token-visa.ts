import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingNetworkTokenVisa = Schema.Struct({
  card_reference_id: Schema.NullOr(Schema.String),
  token_reference_id: Schema.String,
  token_requestor_id: Schema.String,
  token_risk_score: Schema.optional(Schema.String),
})
export type IssuingNetworkTokenVisa = typeof IssuingNetworkTokenVisa.Type
