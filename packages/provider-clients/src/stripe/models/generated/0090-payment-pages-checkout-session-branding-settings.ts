import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentPagesCheckoutSessionBrandingSettings = Schema.Struct({
  background_color: Schema.String,
  border_style: Schema.Literal("pill", "rectangular", "rounded"),
  button_color: Schema.String,
  display_name: Schema.String,
  font_family: Schema.String,
  icon: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionBrandingSettingsIcon, any, any> =>
        Models.PaymentPagesCheckoutSessionBrandingSettingsIcon as Schema.Schema<
          Models.PaymentPagesCheckoutSessionBrandingSettingsIcon,
          any,
          any
        >
    )
  ),
  logo: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentPagesCheckoutSessionBrandingSettingsLogo, any, any> =>
        Models.PaymentPagesCheckoutSessionBrandingSettingsLogo as Schema.Schema<
          Models.PaymentPagesCheckoutSessionBrandingSettingsLogo,
          any,
          any
        >
    )
  )
})
export type PaymentPagesCheckoutSessionBrandingSettings = typeof PaymentPagesCheckoutSessionBrandingSettings.Type
