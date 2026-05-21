import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentNextActionWechatPayDisplayQrCode = Schema.Struct({
  data: Schema.String,
  hosted_instructions_url: Schema.String,
  image_data_url: Schema.String,
  image_url_png: Schema.String,
  image_url_svg: Schema.String
})
export type PaymentIntentNextActionWechatPayDisplayQrCode = typeof PaymentIntentNextActionWechatPayDisplayQrCode.Type
