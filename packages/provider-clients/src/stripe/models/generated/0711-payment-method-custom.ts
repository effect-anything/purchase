import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodCustom = Schema.Struct({
  display_name: Schema.NullOr(Schema.String),
  logo: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.CustomLogo, any, any> => Models.CustomLogo as Schema.Schema<Models.CustomLogo, any, any>
    )
  ),
  type: Schema.String
})
export type PaymentMethodCustom = typeof PaymentMethodCustom.Type
