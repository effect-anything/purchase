import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SetupIntentPaymentMethodOptionsLink = Schema.Struct({
  persistent_token: Schema.NullOr(Schema.String)
})
export type SetupIntentPaymentMethodOptionsLink = typeof SetupIntentPaymentMethodOptionsLink.Type
