import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const DisputePaymentMethodDetailsCard = Schema.Struct({
  brand: Schema.String,
  case_type: Schema.Literal("block", "chargeback", "compliance", "inquiry", "resolution"),
  network_reason_code: Schema.NullOr(Schema.String)
})
export type DisputePaymentMethodDetailsCard = typeof DisputePaymentMethodDetailsCard.Type
