import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodUsBankAccountBlocked = Schema.Struct({
  network_code: Schema.NullOr(Schema.Literal("R02", "R03", "R04", "R05", "R07", "R08", "R10", "R11", "R16", "R20", "R29", "R31")),
  reason: Schema.NullOr(Schema.Literal("bank_account_closed", "bank_account_frozen", "bank_account_invalid_details", "bank_account_restricted", "bank_account_unusable", "debit_not_authorized", "tokenized_account_number_deactivated")),
})
export type PaymentMethodUsBankAccountBlocked = typeof PaymentMethodUsBankAccountBlocked.Type
