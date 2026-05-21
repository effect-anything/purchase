import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DisputePaymentMethodDetailsPaypal = Schema.Struct({
  case_id: Schema.NullOr(Schema.String),
  reason_code: Schema.NullOr(Schema.String)
})
export type DisputePaymentMethodDetailsPaypal = typeof DisputePaymentMethodDetailsPaypal.Type
