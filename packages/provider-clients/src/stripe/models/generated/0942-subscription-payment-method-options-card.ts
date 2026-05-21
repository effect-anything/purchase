import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const SubscriptionPaymentMethodOptionsCard = Schema.Struct({
  mandate_options: Schema.optional(
    Schema.suspend(
      (): Schema.Schema<Models.InvoiceMandateOptionsCard, any, any> =>
        Models.InvoiceMandateOptionsCard as Schema.Schema<Models.InvoiceMandateOptionsCard, any, any>
    )
  ),
  network: Schema.NullOr(
    Schema.Literal(
      "amex",
      "cartes_bancaires",
      "diners",
      "discover",
      "eftpos_au",
      "girocard",
      "interac",
      "jcb",
      "link",
      "mastercard",
      "unionpay",
      "unknown",
      "visa"
    )
  ),
  request_three_d_secure: Schema.NullOr(Schema.Literal("any", "automatic", "challenge"))
})
export type SubscriptionPaymentMethodOptionsCard = typeof SubscriptionPaymentMethodOptionsCard.Type
