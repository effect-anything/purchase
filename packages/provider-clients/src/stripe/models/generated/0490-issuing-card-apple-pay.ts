import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingCardApplePay = Schema.Struct({
  eligible: Schema.Boolean,
  ineligible_reason: Schema.NullOr(Schema.Literal("missing_agreement", "missing_cardholder_contact", "unsupported_region")),
})
export type IssuingCardApplePay = typeof IssuingCardApplePay.Type
