import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentNextActionWechatPayRedirectToAndroidApp = Schema.Struct({
  app_id: Schema.String,
  nonce_str: Schema.String,
  package: Schema.String,
  partner_id: Schema.String,
  prepay_id: Schema.String,
  sign: Schema.String,
  timestamp: Schema.String
})
export type PaymentIntentNextActionWechatPayRedirectToAndroidApp =
  typeof PaymentIntentNextActionWechatPayRedirectToAndroidApp.Type
