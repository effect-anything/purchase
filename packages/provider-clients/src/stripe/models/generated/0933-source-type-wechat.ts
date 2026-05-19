import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SourceTypeWechat = Schema.Struct({
  prepay_id: Schema.optional(Schema.String),
  qr_code_url: Schema.optional(Schema.NullOr(Schema.String)),
  statement_descriptor: Schema.optional(Schema.String),
})
export type SourceTypeWechat = typeof SourceTypeWechat.Type
