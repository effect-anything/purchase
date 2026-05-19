import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SourceTypeMultibanco = Schema.Struct({
  entity: Schema.optional(Schema.NullOr(Schema.String)),
  reference: Schema.optional(Schema.NullOr(Schema.String)),
  refund_account_holder_address_city: Schema.optional(Schema.NullOr(Schema.String)),
  refund_account_holder_address_country: Schema.optional(Schema.NullOr(Schema.String)),
  refund_account_holder_address_line1: Schema.optional(Schema.NullOr(Schema.String)),
  refund_account_holder_address_line2: Schema.optional(Schema.NullOr(Schema.String)),
  refund_account_holder_address_postal_code: Schema.optional(Schema.NullOr(Schema.String)),
  refund_account_holder_address_state: Schema.optional(Schema.NullOr(Schema.String)),
  refund_account_holder_name: Schema.optional(Schema.NullOr(Schema.String)),
  refund_iban: Schema.optional(Schema.NullOr(Schema.String)),
})
export type SourceTypeMultibanco = typeof SourceTypeMultibanco.Type
