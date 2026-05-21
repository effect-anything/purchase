import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SourceTypeAlipay = Schema.Struct({
  data_string: Schema.optional(Schema.NullOr(Schema.String)),
  native_url: Schema.optional(Schema.NullOr(Schema.String)),
  statement_descriptor: Schema.optional(Schema.NullOr(Schema.String))
})
export type SourceTypeAlipay = typeof SourceTypeAlipay.Type
