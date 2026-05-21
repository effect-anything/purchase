import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentNextActionCashappQrCode = Schema.Struct({
  expires_at: Schema.Number,
  image_url_png: Schema.String,
  image_url_svg: Schema.String
})
export type PaymentIntentNextActionCashappQrCode = typeof PaymentIntentNextActionCashappQrCode.Type
