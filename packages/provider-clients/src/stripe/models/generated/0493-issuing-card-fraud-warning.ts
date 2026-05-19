import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingCardFraudWarning = Schema.Struct({
  started_at: Schema.NullOr(Schema.Number),
  type: Schema.NullOr(Schema.Literal("card_testing_exposure", "fraud_dispute_filed", "third_party_reported", "user_indicated_fraud")),
})
export type IssuingCardFraudWarning = typeof IssuingCardFraudWarning.Type
