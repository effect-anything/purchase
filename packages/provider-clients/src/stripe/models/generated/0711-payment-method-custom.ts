import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodCustom = Schema.Struct({
  display_name: Schema.NullOr(Schema.String),
  logo: Schema.NullOr(Schema.suspend((): typeof Models.CustomLogo => Models.CustomLogo)),
  type: Schema.String,
})
export type PaymentMethodCustom = typeof PaymentMethodCustom.Type
