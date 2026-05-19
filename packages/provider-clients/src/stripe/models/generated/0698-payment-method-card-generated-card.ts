import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodCardGeneratedCard = Schema.Struct({
  charge: Schema.NullOr(Schema.String),
  payment_method_details: Schema.NullOr(Schema.suspend((): typeof Models.CardGeneratedFromPaymentMethodDetails => Models.CardGeneratedFromPaymentMethodDetails)),
  setup_attempt: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.SetupAttempt => Models.SetupAttempt))),
})
export type PaymentMethodCardGeneratedCard = typeof PaymentMethodCardGeneratedCard.Type
