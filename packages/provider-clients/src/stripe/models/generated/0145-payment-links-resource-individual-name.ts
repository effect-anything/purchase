import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentLinksResourceIndividualName = Schema.Struct({
  enabled: Schema.Boolean,
  optional: Schema.Boolean
})
export type PaymentLinksResourceIndividualName = typeof PaymentLinksResourceIndividualName.Type
