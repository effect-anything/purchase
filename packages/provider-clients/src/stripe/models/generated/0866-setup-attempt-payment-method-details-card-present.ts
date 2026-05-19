import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SetupAttemptPaymentMethodDetailsCardPresent = Schema.Struct({
  generated_card: Schema.NullOr(Schema.Union(Schema.String, Schema.suspend((): typeof Models.PaymentMethod => Models.PaymentMethod))),
  offline: Schema.NullOr(Schema.suspend((): typeof Models.PaymentMethodDetailsCardPresentOffline => Models.PaymentMethodDetailsCardPresentOffline)),
})
export type SetupAttemptPaymentMethodDetailsCardPresent = typeof SetupAttemptPaymentMethodDetailsCardPresent.Type
