import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionBrandingSettingsLogo = Schema.Struct({
  file: Schema.optional(Schema.String),
  type: Schema.Literal("file", "url"),
  url: Schema.optional(Schema.String)
})
export type PaymentPagesCheckoutSessionBrandingSettingsLogo =
  typeof PaymentPagesCheckoutSessionBrandingSettingsLogo.Type
