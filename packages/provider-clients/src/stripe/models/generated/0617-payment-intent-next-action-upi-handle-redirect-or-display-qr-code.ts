import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentIntentNextActionUpiHandleRedirectOrDisplayQrCode = Schema.Struct({
  hosted_instructions_url: Schema.String,
  qr_code: Schema.suspend((): typeof Models.PaymentIntentNextActionUpiqrCode => Models.PaymentIntentNextActionUpiqrCode),
})
export type PaymentIntentNextActionUpiHandleRedirectOrDisplayQrCode = typeof PaymentIntentNextActionUpiHandleRedirectOrDisplayQrCode.Type
