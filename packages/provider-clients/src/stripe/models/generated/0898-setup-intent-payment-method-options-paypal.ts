import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const SetupIntentPaymentMethodOptionsPaypal = Schema.Struct({
  billing_agreement_id: Schema.NullOr(Schema.String),
})
export type SetupIntentPaymentMethodOptionsPaypal = typeof SetupIntentPaymentMethodOptionsPaypal.Type
