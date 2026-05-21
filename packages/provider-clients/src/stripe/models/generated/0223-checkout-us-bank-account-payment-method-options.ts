import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const CheckoutUsBankAccountPaymentMethodOptions = Schema.Struct({
  financial_connections: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.LinkedAccountOptionsCommon, any, any> =>
        Models.LinkedAccountOptionsCommon as Schema.Schema<Models.LinkedAccountOptionsCommon, any, any>
    )
  ),
  setup_future_usage: Schema.optional(Schema.Literal("none", "off_session", "on_session")),
  target_date: Schema.optional(Schema.String),
  verification_method: Schema.optional(Schema.Literal("automatic", "instant"))
})
export type CheckoutUsBankAccountPaymentMethodOptions = typeof CheckoutUsBankAccountPaymentMethodOptions.Type
