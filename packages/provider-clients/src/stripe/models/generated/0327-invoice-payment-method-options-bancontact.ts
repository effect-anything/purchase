import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const InvoicePaymentMethodOptionsBancontact = Schema.Struct({
  preferred_language: Schema.Literal("de", "en", "fr", "nl")
})
export type InvoicePaymentMethodOptionsBancontact = typeof InvoicePaymentMethodOptionsBancontact.Type
