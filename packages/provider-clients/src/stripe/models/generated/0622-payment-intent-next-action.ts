import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentIntentNextAction = Schema.Struct({
  alipay_handle_redirect: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentNextActionAlipayHandleRedirect => Models.PaymentIntentNextActionAlipayHandleRedirect)),
  boleto_display_details: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentNextActionBoleto => Models.PaymentIntentNextActionBoleto)),
  card_await_notification: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentNextActionCardAwaitNotification => Models.PaymentIntentNextActionCardAwaitNotification)),
  cashapp_handle_redirect_or_display_qr_code: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentNextActionCashappHandleRedirectOrDisplayQrCode => Models.PaymentIntentNextActionCashappHandleRedirectOrDisplayQrCode)),
  display_bank_transfer_instructions: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentNextActionDisplayBankTransferInstructions => Models.PaymentIntentNextActionDisplayBankTransferInstructions)),
  klarna_display_qr_code: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentNextActionKlarnaDisplayQrCode => Models.PaymentIntentNextActionKlarnaDisplayQrCode)),
  konbini_display_details: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentNextActionKonbini => Models.PaymentIntentNextActionKonbini)),
  multibanco_display_details: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentNextActionDisplayMultibancoDetails => Models.PaymentIntentNextActionDisplayMultibancoDetails)),
  oxxo_display_details: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentNextActionDisplayOxxoDetails => Models.PaymentIntentNextActionDisplayOxxoDetails)),
  paynow_display_qr_code: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentNextActionPaynowDisplayQrCode => Models.PaymentIntentNextActionPaynowDisplayQrCode)),
  pix_display_qr_code: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentNextActionPixDisplayQrCode => Models.PaymentIntentNextActionPixDisplayQrCode)),
  promptpay_display_qr_code: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentNextActionPromptpayDisplayQrCode => Models.PaymentIntentNextActionPromptpayDisplayQrCode)),
  redirect_to_url: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentNextActionRedirectToUrl => Models.PaymentIntentNextActionRedirectToUrl)),
  swish_handle_redirect_or_display_qr_code: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentNextActionSwishHandleRedirectOrDisplayQrCode => Models.PaymentIntentNextActionSwishHandleRedirectOrDisplayQrCode)),
  type: Schema.String,
  upi_handle_redirect_or_display_qr_code: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentNextActionUpiHandleRedirectOrDisplayQrCode => Models.PaymentIntentNextActionUpiHandleRedirectOrDisplayQrCode)),
  use_stripe_sdk: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  verify_with_microdeposits: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentNextActionVerifyWithMicrodeposits => Models.PaymentIntentNextActionVerifyWithMicrodeposits)),
  wechat_pay_display_qr_code: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentNextActionWechatPayDisplayQrCode => Models.PaymentIntentNextActionWechatPayDisplayQrCode)),
  wechat_pay_redirect_to_android_app: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentNextActionWechatPayRedirectToAndroidApp => Models.PaymentIntentNextActionWechatPayRedirectToAndroidApp)),
  wechat_pay_redirect_to_ios_app: Schema.optional(Schema.suspend((): typeof Models.PaymentIntentNextActionWechatPayRedirectToIosApp => Models.PaymentIntentNextActionWechatPayRedirectToIosApp)),
})
export type PaymentIntentNextAction = typeof PaymentIntentNextAction.Type
