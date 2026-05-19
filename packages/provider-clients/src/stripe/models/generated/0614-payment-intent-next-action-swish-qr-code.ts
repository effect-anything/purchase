import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentIntentNextActionSwishQrCode = Schema.Struct({
  data: Schema.String,
  image_url_png: Schema.String,
  image_url_svg: Schema.String,
})
export type PaymentIntentNextActionSwishQrCode = typeof PaymentIntentNextActionSwishQrCode.Type
