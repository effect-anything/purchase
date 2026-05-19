import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AccountBacsDebitPaymentsSettings = Schema.Struct({
  display_name: Schema.NullOr(Schema.String),
  service_user_number: Schema.NullOr(Schema.String),
})
export type AccountBacsDebitPaymentsSettings = typeof AccountBacsDebitPaymentsSettings.Type
