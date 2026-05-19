import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentIntentNextActionRedirectToUrl = Schema.Struct({
  return_url: Schema.NullOr(Schema.String),
  url: Schema.NullOr(Schema.String),
})
export type PaymentIntentNextActionRedirectToUrl = typeof PaymentIntentNextActionRedirectToUrl.Type
