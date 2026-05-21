import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsInteracPresentReceipt = Schema.Struct({
  account_type: Schema.optional(Schema.Literal("checking", "savings", "unknown")),
  application_cryptogram: Schema.NullOr(Schema.String),
  application_preferred_name: Schema.NullOr(Schema.String),
  authorization_code: Schema.NullOr(Schema.String),
  authorization_response_code: Schema.NullOr(Schema.String),
  cardholder_verification_method: Schema.NullOr(Schema.String),
  dedicated_file_name: Schema.NullOr(Schema.String),
  terminal_verification_results: Schema.NullOr(Schema.String),
  transaction_status_information: Schema.NullOr(Schema.String)
})
export type PaymentMethodDetailsInteracPresentReceipt = typeof PaymentMethodDetailsInteracPresentReceipt.Type
