import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentNextActionKlarnaDisplayQrCode = Schema.Struct({
  data: Schema.String,
  expires_at: Schema.NullOr(Schema.Number),
  image_url_png: Schema.String,
  image_url_svg: Schema.String
})
export type PaymentIntentNextActionKlarnaDisplayQrCode = typeof PaymentIntentNextActionKlarnaDisplayQrCode.Type
