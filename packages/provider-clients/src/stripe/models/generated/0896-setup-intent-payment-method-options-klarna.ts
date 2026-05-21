import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SetupIntentPaymentMethodOptionsKlarna = Schema.Struct({
  currency: Schema.NullOr(Schema.String),
  preferred_locale: Schema.NullOr(Schema.String)
})
export type SetupIntentPaymentMethodOptionsKlarna = typeof SetupIntentPaymentMethodOptionsKlarna.Type
