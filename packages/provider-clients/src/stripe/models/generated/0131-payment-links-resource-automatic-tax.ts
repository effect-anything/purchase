import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentLinksResourceAutomaticTax = Schema.Struct({
  enabled: Schema.Boolean,
  liability: Schema.NullOr(Schema.suspend((): typeof Models.ConnectAccountReference => Models.ConnectAccountReference)),
})
export type PaymentLinksResourceAutomaticTax = typeof PaymentLinksResourceAutomaticTax.Type
