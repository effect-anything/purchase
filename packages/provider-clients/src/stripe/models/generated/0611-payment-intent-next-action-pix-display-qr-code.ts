import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentIntentNextActionPixDisplayQrCode = Schema.Struct({
  data: Schema.optional(Schema.String),
  expires_at: Schema.optional(Schema.Number),
  hosted_instructions_url: Schema.optional(Schema.String),
  image_url_png: Schema.optional(Schema.String),
  image_url_svg: Schema.optional(Schema.String)
})
export type PaymentIntentNextActionPixDisplayQrCode = typeof PaymentIntentNextActionPixDisplayQrCode.Type
