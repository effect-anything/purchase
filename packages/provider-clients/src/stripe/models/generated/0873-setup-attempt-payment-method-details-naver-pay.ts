import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SetupAttemptPaymentMethodDetailsNaverPay = Schema.Struct({
  buyer_id: Schema.optional(Schema.String),
})
export type SetupAttemptPaymentMethodDetailsNaverPay = typeof SetupAttemptPaymentMethodDetailsNaverPay.Type
