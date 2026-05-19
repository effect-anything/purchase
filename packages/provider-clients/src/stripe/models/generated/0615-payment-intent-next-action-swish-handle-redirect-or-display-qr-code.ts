import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentIntentNextActionSwishHandleRedirectOrDisplayQrCode = Schema.Struct({
  hosted_instructions_url: Schema.String,
  mobile_auth_url: Schema.String,
  qr_code: Schema.suspend((): typeof Models.PaymentIntentNextActionSwishQrCode => Models.PaymentIntentNextActionSwishQrCode),
})
export type PaymentIntentNextActionSwishHandleRedirectOrDisplayQrCode = typeof PaymentIntentNextActionSwishHandleRedirectOrDisplayQrCode.Type
