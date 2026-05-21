import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const Source = Schema.Struct({
  ach_credit_transfer: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceTypeAchCreditTransfer, any, any> =>
        Models.SourceTypeAchCreditTransfer as Schema.Schema<Models.SourceTypeAchCreditTransfer, any, any>
    )
  ),
  ach_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceTypeAchDebit, any, any> =>
        Models.SourceTypeAchDebit as Schema.Schema<Models.SourceTypeAchDebit, any, any>
    )
  ),
  acss_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceTypeAcssDebit, any, any> =>
        Models.SourceTypeAcssDebit as Schema.Schema<Models.SourceTypeAcssDebit, any, any>
    )
  ),
  alipay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceTypeAlipay, any, any> =>
        Models.SourceTypeAlipay as Schema.Schema<Models.SourceTypeAlipay, any, any>
    )
  ),
  allow_redisplay: Schema.NullOr(Schema.Literal("always", "limited", "unspecified")),
  amount: Schema.NullOr(Schema.Number),
  au_becs_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceTypeAuBecsDebit, any, any> =>
        Models.SourceTypeAuBecsDebit as Schema.Schema<Models.SourceTypeAuBecsDebit, any, any>
    )
  ),
  bancontact: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceTypeBancontact, any, any> =>
        Models.SourceTypeBancontact as Schema.Schema<Models.SourceTypeBancontact, any, any>
    )
  ),
  card: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceTypeCard, any, any> =>
        Models.SourceTypeCard as Schema.Schema<Models.SourceTypeCard, any, any>
    )
  ),
  card_present: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceTypeCardPresent, any, any> =>
        Models.SourceTypeCardPresent as Schema.Schema<Models.SourceTypeCardPresent, any, any>
    )
  ),
  client_secret: Schema.String,
  code_verification: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceCodeVerificationFlow, any, any> =>
        Models.SourceCodeVerificationFlow as Schema.Schema<Models.SourceCodeVerificationFlow, any, any>
    )
  ),
  created: Schema.Number,
  currency: Schema.NullOr(Schema.String),
  customer: Schema.optional(Schema.String),
  eps: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceTypeEps, any, any> =>
        Models.SourceTypeEps as Schema.Schema<Models.SourceTypeEps, any, any>
    )
  ),
  flow: Schema.String,
  giropay: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceTypeGiropay, any, any> =>
        Models.SourceTypeGiropay as Schema.Schema<Models.SourceTypeGiropay, any, any>
    )
  ),
  id: Schema.String,
  ideal: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceTypeIdeal, any, any> =>
        Models.SourceTypeIdeal as Schema.Schema<Models.SourceTypeIdeal, any, any>
    )
  ),
  klarna: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceTypeKlarna, any, any> =>
        Models.SourceTypeKlarna as Schema.Schema<Models.SourceTypeKlarna, any, any>
    )
  ),
  livemode: Schema.Boolean,
  metadata: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.String })),
  multibanco: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceTypeMultibanco, any, any> =>
        Models.SourceTypeMultibanco as Schema.Schema<Models.SourceTypeMultibanco, any, any>
    )
  ),
  object: Schema.Literal("source"),
  owner: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SourceOwner, any, any> =>
        Models.SourceOwner as Schema.Schema<Models.SourceOwner, any, any>
    )
  ),
  p24: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceTypeP24, any, any> =>
        Models.SourceTypeP24 as Schema.Schema<Models.SourceTypeP24, any, any>
    )
  ),
  receiver: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceReceiverFlow, any, any> =>
        Models.SourceReceiverFlow as Schema.Schema<Models.SourceReceiverFlow, any, any>
    )
  ),
  redirect: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceRedirectFlow, any, any> =>
        Models.SourceRedirectFlow as Schema.Schema<Models.SourceRedirectFlow, any, any>
    )
  ),
  sepa_credit_transfer: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceTypeSepaCreditTransfer, any, any> =>
        Models.SourceTypeSepaCreditTransfer as Schema.Schema<Models.SourceTypeSepaCreditTransfer, any, any>
    )
  ),
  sepa_debit: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceTypeSepaDebit, any, any> =>
        Models.SourceTypeSepaDebit as Schema.Schema<Models.SourceTypeSepaDebit, any, any>
    )
  ),
  sofort: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceTypeSofort, any, any> =>
        Models.SourceTypeSofort as Schema.Schema<Models.SourceTypeSofort, any, any>
    )
  ),
  source_order: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceOrder, any, any> =>
        Models.SourceOrder as Schema.Schema<Models.SourceOrder, any, any>
    )
  ),
  statement_descriptor: Schema.NullOr(Schema.String),
  status: Schema.String,
  three_d_secure: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceTypeThreeDSecure, any, any> =>
        Models.SourceTypeThreeDSecure as Schema.Schema<Models.SourceTypeThreeDSecure, any, any>
    )
  ),
  type: Schema.Literal(
    "ach_credit_transfer",
    "ach_debit",
    "acss_debit",
    "alipay",
    "au_becs_debit",
    "bancontact",
    "card",
    "card_present",
    "eps",
    "giropay",
    "ideal",
    "klarna",
    "multibanco",
    "p24",
    "sepa_credit_transfer",
    "sepa_debit",
    "sofort",
    "three_d_secure",
    "wechat"
  ),
  usage: Schema.NullOr(Schema.String),
  wechat: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.SourceTypeWechat, any, any> =>
        Models.SourceTypeWechat as Schema.Schema<Models.SourceTypeWechat, any, any>
    )
  )
})
export type Source = typeof Source.Type
