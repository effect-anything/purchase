import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const ChargeOutcome = Schema.Struct({
  advice_code: Schema.NullOr(Schema.Literal("confirm_card_data", "do_not_try_again", "try_again_later")),
  network_advice_code: Schema.NullOr(Schema.String),
  network_decline_code: Schema.NullOr(Schema.String),
  network_status: Schema.NullOr(Schema.String),
  reason: Schema.NullOr(Schema.String),
  risk_level: Schema.optional(Schema.String),
  risk_score: Schema.optional(Schema.Number),
  rule: Schema.optional(
    Schema.Union(
      Schema.String,
      Schema.suspend((): Schema.Schema<Models.Rule, any, any> => Models.Rule as Schema.Schema<Models.Rule, any, any>)
    )
  ),
  seller_message: Schema.NullOr(Schema.String),
  type: Schema.String
})
export type ChargeOutcome = typeof ChargeOutcome.Type
