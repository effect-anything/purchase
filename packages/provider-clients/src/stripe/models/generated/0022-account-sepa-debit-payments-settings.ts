import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AccountSepaDebitPaymentsSettings = Schema.Struct({
  creditor_id: Schema.optional(Schema.String),
})
export type AccountSepaDebitPaymentsSettings = typeof AccountSepaDebitPaymentsSettings.Type
