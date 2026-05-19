import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentIntentNextActionCashappHandleRedirectOrDisplayQrCode = Schema.Struct({
  hosted_instructions_url: Schema.String,
  mobile_auth_url: Schema.String,
  qr_code: Schema.suspend((): typeof Models.PaymentIntentNextActionCashappQrCode => Models.PaymentIntentNextActionCashappQrCode),
})
export type PaymentIntentNextActionCashappHandleRedirectOrDisplayQrCode = typeof PaymentIntentNextActionCashappHandleRedirectOrDisplayQrCode.Type
