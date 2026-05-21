import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type Mandate = {
  readonly customer_acceptance: Models.CustomerAcceptance
  readonly id: string
  readonly livemode: boolean
  readonly multi_use?: Models.MandateMultiUse
  readonly object: "mandate"
  readonly on_behalf_of?: string
  readonly payment_method: string | Models.PaymentMethod
  readonly payment_method_details: Models.MandatePaymentMethodDetails
  readonly single_use?: Models.MandateSingleUse
  readonly status: "active" | "inactive" | "pending"
  readonly type: "multi_use" | "single_use"
}

export const Mandate = Schema.Struct({
  customer_acceptance: Schema.suspend(
    (): Schema.Schema<Models.CustomerAcceptance, any, any> =>
      Models.CustomerAcceptance as Schema.Schema<Models.CustomerAcceptance, any, any>
  ),
  id: Schema.String,
  livemode: Schema.Boolean,
  multi_use: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MandateMultiUse, any, any> =>
        Models.MandateMultiUse as Schema.Schema<Models.MandateMultiUse, any, any>
    )
  ),
  object: Schema.Literal("mandate"),
  on_behalf_of: Schema.optional(Schema.String),
  payment_method: Schema.Union(
    Schema.String,
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethod, any, any> =>
        Models.PaymentMethod as Schema.Schema<Models.PaymentMethod, any, any>
    )
  ),
  payment_method_details: Schema.suspend(
    (): Schema.Schema<Models.MandatePaymentMethodDetails, any, any> =>
      Models.MandatePaymentMethodDetails as Schema.Schema<Models.MandatePaymentMethodDetails, any, any>
  ),
  single_use: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.MandateSingleUse, any, any> =>
        Models.MandateSingleUse as Schema.Schema<Models.MandateSingleUse, any, any>
    )
  ),
  status: Schema.Literal("active", "inactive", "pending"),
  type: Schema.Literal("multi_use", "single_use")
})
