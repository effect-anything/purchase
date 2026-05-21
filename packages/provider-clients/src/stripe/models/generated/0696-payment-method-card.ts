import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type PaymentMethodCard = {
  readonly brand: string
  readonly checks: Models.PaymentMethodCardChecks | null
  readonly country: string | null
  readonly description?: string | null
  readonly display_brand: string | null
  readonly exp_month: number
  readonly exp_year: number
  readonly fingerprint?: string | null
  readonly funding: string
  readonly generated_from: Models.PaymentMethodCardGeneratedCard | null
  readonly iin?: string | null
  readonly issuer?: string | null
  readonly last4: string
  readonly networks: Models.Networks | null
  readonly regulated_status: "regulated" | "unregulated" | null
  readonly three_d_secure_usage: Models.ThreeDSecureUsage | null
  readonly wallet: Models.PaymentMethodCardWallet | null
}

export const PaymentMethodCard = Schema.Struct({
  brand: Schema.String,
  checks: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodCardChecks, any, any> =>
        Models.PaymentMethodCardChecks as Schema.Schema<Models.PaymentMethodCardChecks, any, any>
    )
  ),
  country: Schema.NullOr(Schema.String),
  description: Schema.optional(Schema.NullOr(Schema.String)),
  display_brand: Schema.NullOr(Schema.String),
  exp_month: Schema.Number,
  exp_year: Schema.Number,
  fingerprint: Schema.optional(Schema.NullOr(Schema.String)),
  funding: Schema.String,
  generated_from: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodCardGeneratedCard, any, any> =>
        Models.PaymentMethodCardGeneratedCard as Schema.Schema<Models.PaymentMethodCardGeneratedCard, any, any>
    )
  ),
  iin: Schema.optional(Schema.NullOr(Schema.String)),
  issuer: Schema.optional(Schema.NullOr(Schema.String)),
  last4: Schema.String,
  networks: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.Networks, any, any> => Models.Networks as Schema.Schema<Models.Networks, any, any>
    )
  ),
  regulated_status: Schema.NullOr(Schema.Literal("regulated", "unregulated")),
  three_d_secure_usage: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ThreeDSecureUsage, any, any> =>
        Models.ThreeDSecureUsage as Schema.Schema<Models.ThreeDSecureUsage, any, any>
    )
  ),
  wallet: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.PaymentMethodCardWallet, any, any> =>
        Models.PaymentMethodCardWallet as Schema.Schema<Models.PaymentMethodCardWallet, any, any>
    )
  )
})
