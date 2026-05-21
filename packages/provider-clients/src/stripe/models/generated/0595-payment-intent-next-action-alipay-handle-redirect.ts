import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentNextActionAlipayHandleRedirect = Schema.Struct({
  native_data: Schema.NullOr(Schema.String),
  native_url: Schema.NullOr(Schema.String),
  return_url: Schema.NullOr(Schema.String),
  url: Schema.NullOr(Schema.String)
})
export type PaymentIntentNextActionAlipayHandleRedirect = typeof PaymentIntentNextActionAlipayHandleRedirect.Type
