import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingAuthorizationNetworkData = Schema.Struct({
  acquiring_institution_id: Schema.NullOr(Schema.String),
  system_trace_audit_number: Schema.NullOr(Schema.String),
  transaction_id: Schema.NullOr(Schema.String)
})
export type IssuingAuthorizationNetworkData = typeof IssuingAuthorizationNetworkData.Type
