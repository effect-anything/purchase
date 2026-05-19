import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AccountPaymentsSettings = Schema.Struct({
  statement_descriptor: Schema.NullOr(Schema.String),
  statement_descriptor_kana: Schema.NullOr(Schema.String),
  statement_descriptor_kanji: Schema.NullOr(Schema.String),
  statement_descriptor_prefix_kana: Schema.NullOr(Schema.String),
  statement_descriptor_prefix_kanji: Schema.NullOr(Schema.String),
})
export type AccountPaymentsSettings = typeof AccountPaymentsSettings.Type
