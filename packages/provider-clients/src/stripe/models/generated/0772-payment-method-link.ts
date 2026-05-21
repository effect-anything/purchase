import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodLink = Schema.Struct({
  email: Schema.NullOr(Schema.String),
  persistent_token: Schema.optional(Schema.String)
})
export type PaymentMethodLink = typeof PaymentMethodLink.Type
