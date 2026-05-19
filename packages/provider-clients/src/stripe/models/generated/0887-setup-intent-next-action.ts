import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SetupIntentNextAction = Schema.Struct({
  cashapp_handle_redirect_or_display_qr_code: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentNextActionCashappHandleRedirectOrDisplayQrCode => Models.PaymentIntentNextActionCashappHandleRedirectOrDisplayQrCode)),
  pix_display_qr_code: Schema.optional(Schema.suspend((): typeof Models.SetupIntentNextActionPixDisplayQrCode => Models.SetupIntentNextActionPixDisplayQrCode)),
  redirect_to_url: Schema.optional(Schema.suspend((): typeof Models.SetupIntentNextActionRedirectToUrl => Models.SetupIntentNextActionRedirectToUrl)),
  type: Schema.String,
  upi_handle_redirect_or_display_qr_code: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentNextActionUpiHandleRedirectOrDisplayQrCode => Models.PaymentIntentNextActionUpiHandleRedirectOrDisplayQrCode)),
  use_stripe_sdk: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  verify_with_microdeposits: Schema.optional(Schema.suspend((): typeof Models.SetupIntentNextActionVerifyWithMicrodeposits => Models.SetupIntentNextActionVerifyWithMicrodeposits)),
})
export type SetupIntentNextAction = typeof SetupIntentNextAction.Type
