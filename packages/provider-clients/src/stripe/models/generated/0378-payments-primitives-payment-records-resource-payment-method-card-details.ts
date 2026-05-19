import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetails = Schema.Struct({
  authorization_code: Schema.NullOr(Schema.String),
  brand: Schema.NullOr(Schema.Literal("amex", "cartes_bancaires", "diners", "discover", "eftpos_au", "interac", "jcb", "link", "mastercard", "unionpay", "unknown", "visa")),
  capture_before: Schema.optional(Schema.Number),
  checks: Schema.NullOr(Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceChecks => Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceChecks)),
  country: Schema.NullOr(Schema.String),
  description: Schema.NullOr(Schema.String),
  exp_month: Schema.NullOr(Schema.Number),
  exp_year: Schema.NullOr(Schema.Number),
  fingerprint: Schema.optional(Schema.NullOr(Schema.String)),
  funding: Schema.NullOr(Schema.Literal("credit", "debit", "prepaid", "unknown")),
  iin: Schema.NullOr(Schema.String),
  installments: Schema.NullOr(Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceInstallments => Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceInstallments)),
  issuer: Schema.NullOr(Schema.String),
  last4: Schema.NullOr(Schema.String),
  moto: Schema.optional(Schema.NullOr(Schema.Boolean)),
  network: Schema.NullOr(Schema.Literal("amex", "cartes_bancaires", "diners", "discover", "eftpos_au", "interac", "jcb", "link", "mastercard", "unionpay", "unknown", "visa")),
  network_advice_code: Schema.NullOr(Schema.String),
  network_decline_code: Schema.NullOr(Schema.String),
  network_token: Schema.optional(Schema.NullOr(Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceNetworkToken => Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceNetworkToken))),
  network_transaction_id: Schema.NullOr(Schema.String),
  stored_credential_usage: Schema.NullOr(Schema.Literal("recurring", "unscheduled")),
  three_d_secure: Schema.NullOr(Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceThreeDSecure => Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceThreeDSecure)),
  wallet: Schema.NullOr(Schema.suspend((): typeof Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceWallet => Models.PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetailsResourceWallet)),
})
export type PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetails = typeof PaymentsPrimitivesPaymentRecordsResourcePaymentMethodCardDetails.Type
