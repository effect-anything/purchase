import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SetupIntentNextAction = Schema.Struct({
  cashapp_handle_redirect_or_display_qr_code: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextActionCashappHandleRedirectOrDisplayQrCode, any, any> =>
        Models.PaymentIntentNextActionCashappHandleRedirectOrDisplayQrCode as Schema.Schema<
          Models.PaymentIntentNextActionCashappHandleRedirectOrDisplayQrCode,
          any,
          any
        >
    )
  ),
  pix_display_qr_code: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupIntentNextActionPixDisplayQrCode, any, any> =>
        Models.SetupIntentNextActionPixDisplayQrCode as Schema.Schema<
          Models.SetupIntentNextActionPixDisplayQrCode,
          any,
          any
        >
    )
  ),
  redirect_to_url: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupIntentNextActionRedirectToUrl, any, any> =>
        Models.SetupIntentNextActionRedirectToUrl as Schema.Schema<Models.SetupIntentNextActionRedirectToUrl, any, any>
    )
  ),
  type: Schema.String,
  upi_handle_redirect_or_display_qr_code: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextActionUpiHandleRedirectOrDisplayQrCode, any, any> =>
        Models.PaymentIntentNextActionUpiHandleRedirectOrDisplayQrCode as Schema.Schema<
          Models.PaymentIntentNextActionUpiHandleRedirectOrDisplayQrCode,
          any,
          any
        >
    )
  ),
  use_stripe_sdk: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  verify_with_microdeposits: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SetupIntentNextActionVerifyWithMicrodeposits, any, any> =>
        Models.SetupIntentNextActionVerifyWithMicrodeposits as Schema.Schema<
          Models.SetupIntentNextActionVerifyWithMicrodeposits,
          any,
          any
        >
    )
  )
})
export type SetupIntentNextAction = typeof SetupIntentNextAction.Type
