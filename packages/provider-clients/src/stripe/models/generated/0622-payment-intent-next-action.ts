import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentNextAction = Schema.Struct({
  alipay_handle_redirect: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextActionAlipayHandleRedirect, any, any> =>
        Models.PaymentIntentNextActionAlipayHandleRedirect as Schema.Schema<
          Models.PaymentIntentNextActionAlipayHandleRedirect,
          any,
          any
        >
    )
  ),
  boleto_display_details: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextActionBoleto, any, any> =>
        Models.PaymentIntentNextActionBoleto as Schema.Schema<Models.PaymentIntentNextActionBoleto, any, any>
    )
  ),
  card_await_notification: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextActionCardAwaitNotification, any, any> =>
        Models.PaymentIntentNextActionCardAwaitNotification as Schema.Schema<
          Models.PaymentIntentNextActionCardAwaitNotification,
          any,
          any
        >
    )
  ),
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
  display_bank_transfer_instructions: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextActionDisplayBankTransferInstructions, any, any> =>
        Models.PaymentIntentNextActionDisplayBankTransferInstructions as Schema.Schema<
          Models.PaymentIntentNextActionDisplayBankTransferInstructions,
          any,
          any
        >
    )
  ),
  klarna_display_qr_code: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextActionKlarnaDisplayQrCode, any, any> =>
        Models.PaymentIntentNextActionKlarnaDisplayQrCode as Schema.Schema<
          Models.PaymentIntentNextActionKlarnaDisplayQrCode,
          any,
          any
        >
    )
  ),
  konbini_display_details: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextActionKonbini, any, any> =>
        Models.PaymentIntentNextActionKonbini as Schema.Schema<Models.PaymentIntentNextActionKonbini, any, any>
    )
  ),
  multibanco_display_details: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextActionDisplayMultibancoDetails, any, any> =>
        Models.PaymentIntentNextActionDisplayMultibancoDetails as Schema.Schema<
          Models.PaymentIntentNextActionDisplayMultibancoDetails,
          any,
          any
        >
    )
  ),
  oxxo_display_details: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextActionDisplayOxxoDetails, any, any> =>
        Models.PaymentIntentNextActionDisplayOxxoDetails as Schema.Schema<
          Models.PaymentIntentNextActionDisplayOxxoDetails,
          any,
          any
        >
    )
  ),
  paynow_display_qr_code: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextActionPaynowDisplayQrCode, any, any> =>
        Models.PaymentIntentNextActionPaynowDisplayQrCode as Schema.Schema<
          Models.PaymentIntentNextActionPaynowDisplayQrCode,
          any,
          any
        >
    )
  ),
  pix_display_qr_code: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextActionPixDisplayQrCode, any, any> =>
        Models.PaymentIntentNextActionPixDisplayQrCode as Schema.Schema<
          Models.PaymentIntentNextActionPixDisplayQrCode,
          any,
          any
        >
    )
  ),
  promptpay_display_qr_code: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextActionPromptpayDisplayQrCode, any, any> =>
        Models.PaymentIntentNextActionPromptpayDisplayQrCode as Schema.Schema<
          Models.PaymentIntentNextActionPromptpayDisplayQrCode,
          any,
          any
        >
    )
  ),
  redirect_to_url: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextActionRedirectToUrl, any, any> =>
        Models.PaymentIntentNextActionRedirectToUrl as Schema.Schema<
          Models.PaymentIntentNextActionRedirectToUrl,
          any,
          any
        >
    )
  ),
  swish_handle_redirect_or_display_qr_code: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextActionSwishHandleRedirectOrDisplayQrCode, any, any> =>
        Models.PaymentIntentNextActionSwishHandleRedirectOrDisplayQrCode as Schema.Schema<
          Models.PaymentIntentNextActionSwishHandleRedirectOrDisplayQrCode,
          any,
          any
        >
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
      (): Schema.Schema<Models.PaymentIntentNextActionVerifyWithMicrodeposits, any, any> =>
        Models.PaymentIntentNextActionVerifyWithMicrodeposits as Schema.Schema<
          Models.PaymentIntentNextActionVerifyWithMicrodeposits,
          any,
          any
        >
    )
  ),
  wechat_pay_display_qr_code: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextActionWechatPayDisplayQrCode, any, any> =>
        Models.PaymentIntentNextActionWechatPayDisplayQrCode as Schema.Schema<
          Models.PaymentIntentNextActionWechatPayDisplayQrCode,
          any,
          any
        >
    )
  ),
  wechat_pay_redirect_to_android_app: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextActionWechatPayRedirectToAndroidApp, any, any> =>
        Models.PaymentIntentNextActionWechatPayRedirectToAndroidApp as Schema.Schema<
          Models.PaymentIntentNextActionWechatPayRedirectToAndroidApp,
          any,
          any
        >
    )
  ),
  wechat_pay_redirect_to_ios_app: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentIntentNextActionWechatPayRedirectToIosApp, any, any> =>
        Models.PaymentIntentNextActionWechatPayRedirectToIosApp as Schema.Schema<
          Models.PaymentIntentNextActionWechatPayRedirectToIosApp,
          any,
          any
        >
    )
  )
})
export type PaymentIntentNextAction = typeof PaymentIntentNextAction.Type
