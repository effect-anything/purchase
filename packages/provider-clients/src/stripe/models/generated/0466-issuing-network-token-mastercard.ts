import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingNetworkTokenMastercard = Schema.Struct({
  card_reference_id: Schema.optional(Schema.String),
  token_reference_id: Schema.String,
  token_requestor_id: Schema.String,
  token_requestor_name: Schema.optional(Schema.String)
})
export type IssuingNetworkTokenMastercard = typeof IssuingNetworkTokenMastercard.Type
