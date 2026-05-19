import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SourceTypeAchCreditTransfer = Schema.Struct({
  account_number: Schema.optional(Schema.NullOr(Schema.String)),
  bank_name: Schema.optional(Schema.NullOr(Schema.String)),
  fingerprint: Schema.optional(Schema.NullOr(Schema.String)),
  refund_account_holder_name: Schema.optional(Schema.NullOr(Schema.String)),
  refund_account_holder_type: Schema.optional(Schema.NullOr(Schema.String)),
  refund_routing_number: Schema.optional(Schema.NullOr(Schema.String)),
  routing_number: Schema.optional(Schema.NullOr(Schema.String)),
  swift_code: Schema.optional(Schema.NullOr(Schema.String)),
})
export type SourceTypeAchCreditTransfer = typeof SourceTypeAchCreditTransfer.Type
