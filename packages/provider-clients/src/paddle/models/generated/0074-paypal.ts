import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Paypal = Schema.Struct({
  email: Schema.String,
  reference: Schema.String
})
export type Paypal = typeof Paypal.Type
