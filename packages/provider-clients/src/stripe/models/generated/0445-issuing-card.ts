import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type IssuingCard = {
  readonly brand: string
  readonly cancellation_reason: "design_rejected" | "fulfillment_error" | "lost" | "stolen" | null
  readonly cardholder: Models.IssuingCardholder
  readonly created: number
  readonly currency: string
  readonly cvc?: string
  readonly exp_month: number
  readonly exp_year: number
  readonly financial_account?: string | null
  readonly id: string
  readonly last4: string
  readonly latest_fraud_warning: Models.IssuingCardFraudWarning | null
  readonly lifecycle_controls: Models.IssuingCardLifecycleControls | null
  readonly livemode: boolean
  readonly metadata: Readonly<Record<string, string>>
  readonly number?: string
  readonly object: "issuing.card"
  readonly personalization_design: string | Models.IssuingPersonalizationDesign | null
  readonly replaced_by: string | Models.IssuingCard | null
  readonly replacement_for: string | Models.IssuingCard | null
  readonly replacement_reason: "damaged" | "expired" | "fulfillment_error" | "lost" | "stolen" | null
  readonly second_line: string | null
  readonly shipping: Models.IssuingCardShipping | null
  readonly spending_controls: Models.IssuingCardAuthorizationControls
  readonly status: "active" | "canceled" | "inactive"
  readonly type: "physical" | "virtual"
  readonly wallets: Models.IssuingCardWallets | null
}

export const IssuingCard = Schema.Struct({
  brand: Schema.String,
  cancellation_reason: Schema.NullOr(Schema.Literal("design_rejected", "fulfillment_error", "lost", "stolen")),
  cardholder: Schema.suspend(
    (): Schema.Schema<Models.IssuingCardholder, any, any> =>
      Models.IssuingCardholder as Schema.Schema<Models.IssuingCardholder, any, any>
  ),
  created: Schema.Number,
  currency: Schema.String,
  cvc: Schema.optional(Schema.String),
  exp_month: Schema.Number,
  exp_year: Schema.Number,
  financial_account: Schema.optional(Schema.NullOr(Schema.String)),
  id: Schema.String,
  last4: Schema.String,
  latest_fraud_warning: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingCardFraudWarning, any, any> =>
        Models.IssuingCardFraudWarning as Schema.Schema<Models.IssuingCardFraudWarning, any, any>
    )
  ),
  lifecycle_controls: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingCardLifecycleControls, any, any> =>
        Models.IssuingCardLifecycleControls as Schema.Schema<Models.IssuingCardLifecycleControls, any, any>
    )
  ),
  livemode: Schema.Boolean,
  metadata: Schema.Record({ key: Schema.String, value: Schema.String }),
  number: Schema.optional(Schema.String),
  object: Schema.Literal("issuing.card"),
  personalization_design: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.IssuingPersonalizationDesign, any, any> =>
          Models.IssuingPersonalizationDesign as Schema.Schema<Models.IssuingPersonalizationDesign, any, any>
      )
    )
  ),
  replaced_by: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.IssuingCard, any, any> =>
          Models.IssuingCard as Schema.Schema<Models.IssuingCard, any, any>
      )
    )
  ),
  replacement_for: Schema.NullOr(
    Schema.Union(
      Schema.String,
      Schema.suspend(
        (): Schema.Schema<Models.IssuingCard, any, any> =>
          Models.IssuingCard as Schema.Schema<Models.IssuingCard, any, any>
      )
    )
  ),
  replacement_reason: Schema.NullOr(Schema.Literal("damaged", "expired", "fulfillment_error", "lost", "stolen")),
  second_line: Schema.NullOr(Schema.String),
  shipping: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingCardShipping, any, any> =>
        Models.IssuingCardShipping as Schema.Schema<Models.IssuingCardShipping, any, any>
    )
  ),
  spending_controls: Schema.suspend(
    (): Schema.Schema<Models.IssuingCardAuthorizationControls, any, any> =>
      Models.IssuingCardAuthorizationControls as Schema.Schema<Models.IssuingCardAuthorizationControls, any, any>
  ),
  status: Schema.Literal("active", "canceled", "inactive"),
  type: Schema.Literal("physical", "virtual"),
  wallets: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.IssuingCardWallets, any, any> =>
        Models.IssuingCardWallets as Schema.Schema<Models.IssuingCardWallets, any, any>
    )
  )
})
