import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsCard = Schema.Struct({
  amount_authorized: Schema.NullOr(Schema.Number),
  authorization_code: Schema.NullOr(Schema.String),
  brand: Schema.NullOr(Schema.String),
  capture_before: Schema.optional(Schema.Number),
  checks: Schema.NullOr(Schema.suspend((): typeof Models.PaymentMethodDetailsCardChecks => Models.PaymentMethodDetailsCardChecks)),
  country: Schema.NullOr(Schema.String),
  description: Schema.optional(Schema.NullOr(Schema.String)),
  exp_month: Schema.Number,
  exp_year: Schema.Number,
  extended_authorization: Schema.optional(Schema.suspend((): typeof Models.PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceEnterpriseFeaturesExtendedAuthorizationExtendedAuthorization => Models.PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceEnterpriseFeaturesExtendedAuthorizationExtendedAuthorization)),
  fingerprint: Schema.optional(Schema.NullOr(Schema.String)),
  funding: Schema.NullOr(Schema.String),
  iin: Schema.optional(Schema.NullOr(Schema.String)),
  incremental_authorization: Schema.optional(Schema.suspend((): typeof Models.PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceEnterpriseFeaturesIncrementalAuthorizationIncrementalAuthorization => Models.PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceEnterpriseFeaturesIncrementalAuthorizationIncrementalAuthorization)),
  installments: Schema.NullOr(Schema.suspend((): typeof Models.PaymentMethodDetailsCardInstallments => Models.PaymentMethodDetailsCardInstallments)),
  issuer: Schema.optional(Schema.NullOr(Schema.String)),
  last4: Schema.NullOr(Schema.String),
  mandate: Schema.NullOr(Schema.String),
  moto: Schema.optional(Schema.NullOr(Schema.Boolean)),
  multicapture: Schema.optional(Schema.suspend((): typeof Models.PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceMulticapture => Models.PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceMulticapture)),
  network: Schema.NullOr(Schema.String),
  network_token: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.PaymentMethodDetailsCardNetworkToken => Models.PaymentMethodDetailsCardNetworkToken))),
  network_transaction_id: Schema.NullOr(Schema.String),
  overcapture: Schema.optional(Schema.suspend((): typeof Models.PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceEnterpriseFeaturesOvercaptureOvercapture => Models.PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceEnterpriseFeaturesOvercaptureOvercapture)),
  regulated_status: Schema.NullOr(Schema.Literal("regulated", "unregulated")),
  three_d_secure: Schema.NullOr(Schema.suspend((): typeof Models.ThreeDSecureDetailsCharge => Models.ThreeDSecureDetailsCharge)),
  wallet: Schema.NullOr(Schema.suspend((): typeof Models.PaymentMethodDetailsCardWallet => Models.PaymentMethodDetailsCardWallet)),
})
export type PaymentMethodDetailsCard = typeof PaymentMethodDetailsCard.Type
