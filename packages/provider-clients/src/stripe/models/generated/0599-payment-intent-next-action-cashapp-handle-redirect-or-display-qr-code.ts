import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentNextActionCashappHandleRedirectOrDisplayQrCode = Schema.Struct({
  hosted_instructions_url: Schema.String,
  mobile_auth_url: Schema.String,
  qr_code: Schema.suspend(
    (): Schema.Schema<Models.PaymentIntentNextActionCashappQrCode, any, any> =>
      Models.PaymentIntentNextActionCashappQrCode as Schema.Schema<
        Models.PaymentIntentNextActionCashappQrCode,
        any,
        any
      >
  )
})
export type PaymentIntentNextActionCashappHandleRedirectOrDisplayQrCode =
  typeof PaymentIntentNextActionCashappHandleRedirectOrDisplayQrCode.Type
