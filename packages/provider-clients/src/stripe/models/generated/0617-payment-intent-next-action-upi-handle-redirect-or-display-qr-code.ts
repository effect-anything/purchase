import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentNextActionUpiHandleRedirectOrDisplayQrCode = Schema.Struct({
  hosted_instructions_url: Schema.String,
  qr_code: Schema.suspend(
    (): Schema.Schema<Models.PaymentIntentNextActionUpiqrCode, any, any> =>
      Models.PaymentIntentNextActionUpiqrCode as Schema.Schema<Models.PaymentIntentNextActionUpiqrCode, any, any>
  )
})
export type PaymentIntentNextActionUpiHandleRedirectOrDisplayQrCode =
  typeof PaymentIntentNextActionUpiHandleRedirectOrDisplayQrCode.Type
