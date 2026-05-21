import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentLinksResourceTaxIdCollection = Schema.Struct({
  enabled: Schema.Boolean,
  required: Schema.Literal("if_supported", "never")
})
export type PaymentLinksResourceTaxIdCollection = typeof PaymentLinksResourceTaxIdCollection.Type
