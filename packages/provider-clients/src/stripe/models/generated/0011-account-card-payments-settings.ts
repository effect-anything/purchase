import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AccountCardPaymentsSettings = Schema.Struct({
  decline_on: Schema.optional(Schema.suspend((): typeof Models.AccountDeclineChargeOn => Models.AccountDeclineChargeOn)),
  statement_descriptor_prefix: Schema.NullOr(Schema.String),
  statement_descriptor_prefix_kana: Schema.NullOr(Schema.String),
  statement_descriptor_prefix_kanji: Schema.NullOr(Schema.String),
})
export type AccountCardPaymentsSettings = typeof AccountCardPaymentsSettings.Type
