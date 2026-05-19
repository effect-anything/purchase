import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const MandatePaypal = Schema.Struct({
  billing_agreement_id: Schema.NullOr(Schema.String),
  payer_id: Schema.NullOr(Schema.String),
})
export type MandatePaypal = typeof MandatePaypal.Type
