import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SourceTypeCardPresent = Schema.Struct({
  application_cryptogram: Schema.optional(Schema.String),
  application_preferred_name: Schema.optional(Schema.String),
  authorization_code: Schema.optional(Schema.NullOr(Schema.String)),
  authorization_response_code: Schema.optional(Schema.String),
  brand: Schema.optional(Schema.NullOr(Schema.String)),
  country: Schema.optional(Schema.NullOr(Schema.String)),
  cvm_type: Schema.optional(Schema.String),
  data_type: Schema.optional(Schema.NullOr(Schema.String)),
  dedicated_file_name: Schema.optional(Schema.String),
  description: Schema.optional(Schema.String),
  emv_auth_data: Schema.optional(Schema.String),
  evidence_customer_signature: Schema.optional(Schema.NullOr(Schema.String)),
  evidence_transaction_certificate: Schema.optional(Schema.NullOr(Schema.String)),
  exp_month: Schema.optional(Schema.NullOr(Schema.Number)),
  exp_year: Schema.optional(Schema.NullOr(Schema.Number)),
  fingerprint: Schema.optional(Schema.String),
  funding: Schema.optional(Schema.NullOr(Schema.String)),
  iin: Schema.optional(Schema.String),
  issuer: Schema.optional(Schema.String),
  last4: Schema.optional(Schema.NullOr(Schema.String)),
  pos_device_id: Schema.optional(Schema.NullOr(Schema.String)),
  pos_entry_mode: Schema.optional(Schema.String),
  read_method: Schema.optional(Schema.NullOr(Schema.String)),
  reader: Schema.optional(Schema.NullOr(Schema.String)),
  terminal_verification_results: Schema.optional(Schema.String),
  transaction_status_information: Schema.optional(Schema.String)
})
export type SourceTypeCardPresent = typeof SourceTypeCardPresent.Type
