import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type SetupAttemptPaymentMethodDetailsIdeal = {
  readonly bank:
    | "abn_amro"
    | "adyen"
    | "asn_bank"
    | "bunq"
    | "buut"
    | "finom"
    | "handelsbanken"
    | "ing"
    | "knab"
    | "mollie"
    | "moneyou"
    | "n26"
    | "nn"
    | "rabobank"
    | "regiobank"
    | "revolut"
    | "sns_bank"
    | "triodos_bank"
    | "van_lanschot"
    | "yoursafe"
    | null
  readonly bic:
    | "ABNANL2A"
    | "ADYBNL2A"
    | "ASNBNL21"
    | "BITSNL2A"
    | "BUNQNL2A"
    | "BUUTNL2A"
    | "FNOMNL22"
    | "FVLBNL22"
    | "HANDNL2A"
    | "INGBNL2A"
    | "KNABNL2H"
    | "MLLENL2A"
    | "MOYONL21"
    | "NNBANL2G"
    | "NTSBDEB1"
    | "RABONL2U"
    | "RBRBNL21"
    | "REVOIE23"
    | "REVOLT21"
    | "SNSBNL2A"
    | "TRIONL2U"
    | null
  readonly generated_sepa_debit: string | Models.PaymentMethod | null
  readonly generated_sepa_debit_mandate: string | Models.Mandate | null
  readonly iban_last4: string | null
  readonly verified_name: string | null
}

export const SetupAttemptPaymentMethodDetailsIdeal = Schema.Struct({
  bank: Schema.NullOr(
    Schema.Literal(
      "abn_amro",
      "adyen",
      "asn_bank",
      "bunq",
      "buut",
      "finom",
      "handelsbanken",
      "ing",
      "knab",
      "mollie",
      "moneyou",
      "n26",
      "nn",
      "rabobank",
      "regiobank",
      "revolut",
      "sns_bank",
      "triodos_bank",
      "van_lanschot",
      "yoursafe"
    )
  ),
  bic: Schema.NullOr(
    Schema.Literal(
      "ABNANL2A",
      "ADYBNL2A",
      "ASNBNL21",
      "BITSNL2A",
      "BUNQNL2A",
      "BUUTNL2A",
      "FNOMNL22",
      "FVLBNL22",
      "HANDNL2A",
      "INGBNL2A",
      "KNABNL2H",
      "MLLENL2A",
      "MOYONL21",
      "NNBANL2G",
      "NTSBDEB1",
      "RABONL2U",
      "RBRBNL21",
      "REVOIE23",
      "REVOLT21",
      "SNSBNL2A",
      "TRIONL2U"
    )
  ),
  generated_sepa_debit: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.PaymentMethod, any, any> =>
          Models.PaymentMethod as Schema.Schema<Models.PaymentMethod, any, any>
      )
    )
  ),
  generated_sepa_debit_mandate: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.Mandate, any, any> => Models.Mandate as Schema.Schema<Models.Mandate, any, any>
      )
    )
  ),
  iban_last4: Schema.NullOr(Schema.String),
  verified_name: Schema.NullOr(Schema.String)
})
