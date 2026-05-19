import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentLinksResourceBusinessName = Schema.Struct({
  enabled: Schema.Boolean,
  optional: Schema.Boolean,
})
export type PaymentLinksResourceBusinessName = typeof PaymentLinksResourceBusinessName.Type
