import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentNextActionSwishHandleRedirectOrDisplayQrCode = Schema.Struct({
  hosted_instructions_url: Schema.String,
  mobile_auth_url: Schema.String,
  qr_code: Schema.suspend(
    (): Schema.Schema<Models.PaymentIntentNextActionSwishQrCode, any, any> =>
      Models.PaymentIntentNextActionSwishQrCode as Schema.Schema<Models.PaymentIntentNextActionSwishQrCode, any, any>
  )
})
export type PaymentIntentNextActionSwishHandleRedirectOrDisplayQrCode =
  typeof PaymentIntentNextActionSwishHandleRedirectOrDisplayQrCode.Type
