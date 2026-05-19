import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsCardPresent = Schema.Struct({
  amount_authorized: Schema.NullOr(Schema.Number),
  brand: Schema.NullOr(Schema.String),
  brand_product: Schema.NullOr(Schema.String),
  capture_before: Schema.optional(Schema.Number),
  cardholder_name: Schema.NullOr(Schema.String),
  country: Schema.NullOr(Schema.String),
  description: Schema.optional(Schema.NullOr(Schema.String)),
  emv_auth_data: Schema.NullOr(Schema.String),
  exp_month: Schema.Number,
  exp_year: Schema.Number,
  fingerprint: Schema.NullOr(Schema.String),
  funding: Schema.NullOr(Schema.String),
  generated_card: Schema.NullOr(Schema.String),
  iin: Schema.optional(Schema.NullOr(Schema.String)),
  incremental_authorization_supported: Schema.Boolean,
  issuer: Schema.optional(Schema.NullOr(Schema.String)),
  last4: Schema.NullOr(Schema.String),
  location: Schema.optional(Schema.String),
  network: Schema.NullOr(Schema.String),
  network_transaction_id: Schema.NullOr(Schema.String),
  offline: Schema.NullOr(Schema.suspend((): typeof Models.PaymentMethodDetailsCardPresentOffline => Models.PaymentMethodDetailsCardPresentOffline)),
  overcapture_supported: Schema.Boolean,
  preferred_locales: Schema.NullOr(Schema.Array(Schema.String)),
  read_method: Schema.NullOr(Schema.Literal("contact_emv", "contactless_emv", "contactless_magstripe_mode", "magnetic_stripe_fallback", "magnetic_stripe_track2")),
  reader: Schema.optional(Schema.String),
  receipt: Schema.NullOr(Schema.suspend((): typeof Models.PaymentMethodDetailsCardPresentReceipt => Models.PaymentMethodDetailsCardPresentReceipt)),
  wallet: Schema.optional(Schema.suspend((): typeof Models.PaymentFlowsPrivatePaymentMethodsCardPresentCommonWallet => Models.PaymentFlowsPrivatePaymentMethodsCardPresentCommonWallet)),
})
export type PaymentMethodDetailsCardPresent = typeof PaymentMethodDetailsCardPresent.Type
