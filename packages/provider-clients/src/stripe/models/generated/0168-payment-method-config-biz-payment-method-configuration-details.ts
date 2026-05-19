import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodConfigBizPaymentMethodConfigurationDetails = Schema.Struct({
  id: Schema.String,
  parent: Schema.NullOr(Schema.String),
})
export type PaymentMethodConfigBizPaymentMethodConfigurationDetails = typeof PaymentMethodConfigBizPaymentMethodConfigurationDetails.Type
