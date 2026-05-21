import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentLinksResourceAutomaticTax = Schema.Struct({
  enabled: Schema.Boolean,
  liability: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ConnectAccountReference, any, any> =>
        Models.ConnectAccountReference as Schema.Schema<Models.ConnectAccountReference, any, any>
    )
  )
})
export type PaymentLinksResourceAutomaticTax = typeof PaymentLinksResourceAutomaticTax.Type
