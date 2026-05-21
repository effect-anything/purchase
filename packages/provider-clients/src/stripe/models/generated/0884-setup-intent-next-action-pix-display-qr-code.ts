import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SetupIntentNextActionPixDisplayQrCode = Schema.Struct({
  data: Schema.String,
  expires_at: Schema.Number,
  hosted_instructions_url: Schema.String,
  image_url_png: Schema.String,
  image_url_svg: Schema.String
})
export type SetupIntentNextActionPixDisplayQrCode = typeof SetupIntentNextActionPixDisplayQrCode.Type
