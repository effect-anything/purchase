import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsCard = Schema.Struct({
  amount_authorized: Schema.NullOr(Schema.Number),
  authorization_code: Schema.NullOr(Schema.String),
  brand: Schema.NullOr(Schema.String),
  capture_before: Schema.optional(Schema.Number),
  checks: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsCardChecks, any, any> =>
        Models.PaymentMethodDetailsCardChecks as Schema.Schema<Models.PaymentMethodDetailsCardChecks, any, any>
    )
  ),
  country: Schema.NullOr(Schema.String),
  description: Schema.optional(Schema.NullOr(Schema.String)),
  exp_month: Schema.Number,
  exp_year: Schema.Number,
  extended_authorization: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<
        Models.PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceEnterpriseFeaturesExtendedAuthorizationExtendedAuthorization,
        any,
        any
      > =>
        Models.PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceEnterpriseFeaturesExtendedAuthorizationExtendedAuthorization as Schema.Schema<
          Models.PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceEnterpriseFeaturesExtendedAuthorizationExtendedAuthorization,
          any,
          any
        >
    )
  ),
  fingerprint: Schema.optional(Schema.NullOr(Schema.String)),
  funding: Schema.NullOr(Schema.String),
  iin: Schema.optional(Schema.NullOr(Schema.String)),
  incremental_authorization: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<
        Models.PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceEnterpriseFeaturesIncrementalAuthorizationIncrementalAuthorization,
        any,
        any
      > =>
        Models.PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceEnterpriseFeaturesIncrementalAuthorizationIncrementalAuthorization as Schema.Schema<
          Models.PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceEnterpriseFeaturesIncrementalAuthorizationIncrementalAuthorization,
          any,
          any
        >
    )
  ),
  installments: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsCardInstallments, any, any> =>
        Models.PaymentMethodDetailsCardInstallments as Schema.Schema<
          Models.PaymentMethodDetailsCardInstallments,
          any,
          any
        >
    )
  ),
  issuer: Schema.optional(Schema.NullOr(Schema.String)),
  last4: Schema.NullOr(Schema.String),
  mandate: Schema.NullOr(Schema.String),
  moto: Schema.optional(Schema.NullOr(Schema.Boolean)),
  multicapture: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceMulticapture, any, any> =>
        Models.PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceMulticapture as Schema.Schema<
          Models.PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceMulticapture,
          any,
          any
        >
    )
  ),
  network: Schema.NullOr(Schema.String),
  network_token: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<Models.PaymentMethodDetailsCardNetworkToken, any, any> =>
          Models.PaymentMethodDetailsCardNetworkToken as Schema.Schema<
            Models.PaymentMethodDetailsCardNetworkToken,
            any,
            any
          >
      )
    )
  ),
  network_transaction_id: Schema.NullOr(Schema.String),
  overcapture: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<
        Models.PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceEnterpriseFeaturesOvercaptureOvercapture,
        any,
        any
      > =>
        Models.PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceEnterpriseFeaturesOvercaptureOvercapture as Schema.Schema<
          Models.PaymentFlowsPrivatePaymentMethodsCardDetailsApiResourceEnterpriseFeaturesOvercaptureOvercapture,
          any,
          any
        >
    )
  ),
  regulated_status: Schema.NullOr(Schema.Literal("regulated", "unregulated")),
  three_d_secure: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ThreeDSecureDetailsCharge, any, any> =>
        Models.ThreeDSecureDetailsCharge as Schema.Schema<Models.ThreeDSecureDetailsCharge, any, any>
    )
  ),
  wallet: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodDetailsCardWallet, any, any> =>
        Models.PaymentMethodDetailsCardWallet as Schema.Schema<Models.PaymentMethodDetailsCardWallet, any, any>
    )
  )
})
export type PaymentMethodDetailsCard = typeof PaymentMethodDetailsCard.Type
