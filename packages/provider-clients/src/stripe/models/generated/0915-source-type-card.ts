import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SourceTypeCard = Schema.Struct({
  address_line1_check: Schema.optional(Schema.NullOr(Schema.String)),
  address_zip_check: Schema.optional(Schema.NullOr(Schema.String)),
  brand: Schema.optional(Schema.NullOr(Schema.String)),
  country: Schema.optional(Schema.NullOr(Schema.String)),
  cvc_check: Schema.optional(Schema.NullOr(Schema.String)),
  description: Schema.optional(Schema.String),
  dynamic_last4: Schema.optional(Schema.NullOr(Schema.String)),
  exp_month: Schema.optional(Schema.NullOr(Schema.Number)),
  exp_year: Schema.optional(Schema.NullOr(Schema.Number)),
  fingerprint: Schema.optional(Schema.String),
  funding: Schema.optional(Schema.NullOr(Schema.String)),
  iin: Schema.optional(Schema.String),
  issuer: Schema.optional(Schema.String),
  last4: Schema.optional(Schema.NullOr(Schema.String)),
  name: Schema.optional(Schema.NullOr(Schema.String)),
  three_d_secure: Schema.optional(Schema.String),
  tokenization_method: Schema.optional(Schema.NullOr(Schema.String)),
})
export type SourceTypeCard = typeof SourceTypeCard.Type
