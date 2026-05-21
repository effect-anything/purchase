import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentNextActionWechatPayRedirectToIosApp = Schema.Struct({
  native_url: Schema.String
})
export type PaymentIntentNextActionWechatPayRedirectToIosApp =
  typeof PaymentIntentNextActionWechatPayRedirectToIosApp.Type
