import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetails = Schema.Struct({
  authorization_code: Schema.NullOr(Schema.String),
  brand: Schema.NullOr(
    Schema.Literal(
      "amex",
      "cartes_bancaires",
      "diners",
      "discover",
      "eftpos_au",
      "interac",
      "jcb",
      "link",
      "mastercard",
      "unionpay",
      "unknown",
      "visa"
    )
  ),
  capture_before: Schema.optional(Schema.Number),
  checks: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceChecks,
        any,
        any
      > =>
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceChecks as Schema.Schema<
          Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceChecks,
          any,
          any
        >
    )
  ),
  country: Schema.NullOr(Schema.String),
  description: Schema.NullOr(Schema.String),
  exp_month: Schema.NullOr(Schema.Number),
  exp_year: Schema.NullOr(Schema.Number),
  fingerprint: Schema.optional(Schema.NullOr(Schema.String)),
  funding: Schema.NullOr(Schema.Literal("credit", "debit", "prepaid", "unknown")),
  iin: Schema.NullOr(Schema.String),
  installments: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceInstallments,
        any,
        any
      > =>
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceInstallments as Schema.Schema<
          Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceInstallments,
          any,
          any
        >
    )
  ),
  issuer: Schema.NullOr(Schema.String),
  last4: Schema.NullOr(Schema.String),
  moto: Schema.optional(Schema.NullOr(Schema.Boolean)),
  network: Schema.NullOr(
    Schema.Literal(
      "amex",
      "cartes_bancaires",
      "diners",
      "discover",
      "eftpos_au",
      "interac",
      "jcb",
      "link",
      "mastercard",
      "unionpay",
      "unknown",
      "visa"
    )
  ),
  network_advice_code: Schema.NullOr(Schema.String),
  network_decline_code: Schema.NullOr(Schema.String),
  network_token: Schema.optional(
    Schema.NullOr(
      Schema.suspend(
        (): Schema.Schema<
          Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceNetworkToken,
          any,
          any
        > =>
          Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceNetworkToken as Schema.Schema<
            Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceNetworkToken,
            any,
            any
          >
      )
    )
  ),
  network_transaction_id: Schema.NullOr(Schema.String),
  stored_credential_usage: Schema.NullOr(Schema.Literal("recurring", "unscheduled")),
  three_d_secure: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceThreeDSecure,
        any,
        any
      > =>
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceThreeDSecure as Schema.Schema<
          Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceThreeDSecure,
          any,
          any
        >
    )
  ),
  wallet: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceWallet,
        any,
        any
      > =>
        Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceWallet as Schema.Schema<
          Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceWallet,
          any,
          any
        >
    )
  )
})
export type PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetails =
  typeof PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetails.Type
