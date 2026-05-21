import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodInteracPresent = Schema.Struct({
  brand: Schema.NullOr(Schema.String),
  cardholder_name: Schema.NullOr(Schema.String),
  country: Schema.NullOr(Schema.String),
  description: Schema.optional(Schema.NullOr(Schema.String)),
  exp_month: Schema.Number,
  exp_year: Schema.Number,
  fingerprint: Schema.NullOr(Schema.String),
  funding: Schema.NullOr(Schema.String),
  iin: Schema.optional(Schema.NullOr(Schema.String)),
  issuer: Schema.optional(Schema.NullOr(Schema.String)),
  last4: Schema.NullOr(Schema.String),
  networks: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodCardPresentNetworks, any, any> =>
        Models.PaymentMethodCardPresentNetworks as Schema.Schema<Models.PaymentMethodCardPresentNetworks, any, any>
    )
  ),
  preferred_locales: Schema.NullOr(Schema.Array(Schema.String)),
  read_method: Schema.NullOr(
    Schema.Literal(
      "contact_emv",
      "contactless_emv",
      "contactless_magstripe_mode",
      "magnetic_stripe_fallback",
      "magnetic_stripe_track2"
    )
  )
})
export type PaymentMethodInteracPresent = typeof PaymentMethodInteracPresent.Type
