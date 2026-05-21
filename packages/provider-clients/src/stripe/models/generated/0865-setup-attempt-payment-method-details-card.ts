import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SetupAttemptPaymentMethodDetailsCard = Schema.Struct({
  brand: Schema.NullOr(Schema.String),
  checks: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsCardChecks, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsCardChecks as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsCardChecks,
          any,
          any
        >
    )
  ),
  country: Schema.NullOr(Schema.String),
  description: Schema.optional(Schema.NullOr(Schema.String)),
  exp_month: Schema.NullOr(Schema.Number),
  exp_year: Schema.NullOr(Schema.Number),
  fingerprint: Schema.optional(Schema.NullOr(Schema.String)),
  funding: Schema.NullOr(Schema.String),
  iin: Schema.optional(Schema.NullOr(Schema.String)),
  issuer: Schema.optional(Schema.NullOr(Schema.String)),
  last4: Schema.NullOr(Schema.String),
  moto: Schema.optional(Schema.Boolean),
  network: Schema.NullOr(Schema.String),
  three_d_secure: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ThreeDSecureDetails, any, any> =>
        Models.ThreeDSecureDetails as Schema.Schema<Models.ThreeDSecureDetails, any, any>
    )
  ),
  wallet: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.SetupAttemptPaymentMethodDetailsCardWallet, any, any> =>
        Models.SetupAttemptPaymentMethodDetailsCardWallet as Schema.Schema<
          Models.SetupAttemptPaymentMethodDetailsCardWallet,
          any,
          any
        >
    )
  )
})
export type SetupAttemptPaymentMethodDetailsCard = typeof SetupAttemptPaymentMethodDetailsCard.Type
