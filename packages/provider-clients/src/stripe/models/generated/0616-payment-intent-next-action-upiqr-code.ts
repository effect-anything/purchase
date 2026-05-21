import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentNextActionUpiqrCode = Schema.Struct({
  expires_at: Schema.Number,
  image_url_png: Schema.String,
  image_url_svg: Schema.String
})
export type PaymentIntentNextActionUpiqrCode = typeof PaymentIntentNextActionUpiqrCode.Type
