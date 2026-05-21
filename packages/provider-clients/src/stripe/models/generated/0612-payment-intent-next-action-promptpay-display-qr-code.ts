import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentNextActionPromptpayDisplayQrCode = Schema.Struct({
  data: Schema.String,
  hosted_instructions_url: Schema.String,
  image_url_png: Schema.String,
  image_url_svg: Schema.String
})
export type PaymentIntentNextActionPromptpayDisplayQrCode = typeof PaymentIntentNextActionPromptpayDisplayQrCode.Type
