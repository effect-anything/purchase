import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const MandateBacsDebit = Schema.Struct({
  display_name: Schema.NullOr(Schema.String),
  network_status: Schema.Literal("accepted", "pending", "refused", "revoked"),
  reference: Schema.String,
  revocation_reason: Schema.NullOr(
    Schema.Literal(
      "account_closed",
      "bank_account_restricted",
      "bank_ownership_changed",
      "could_not_process",
      "debit_not_authorized"
    )
  ),
  service_user_number: Schema.NullOr(Schema.String),
  url: Schema.String
})
export type MandateBacsDebit = typeof MandateBacsDebit.Type
