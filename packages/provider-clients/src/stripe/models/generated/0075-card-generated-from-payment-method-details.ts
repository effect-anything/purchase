import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const CardGeneratedFromPaymentMethodDetails = Schema.Struct({
  card_present: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodDetailsCardPresent => Models.PaymentMethodDetailsCardPresent)),
  type: Schema.String,
})
export type CardGeneratedFromPaymentMethodDetails = typeof CardGeneratedFromPaymentMethodDetails.Type
