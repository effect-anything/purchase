import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodDetailsPromptpay = Schema.Struct({
  reference: Schema.NullOr(Schema.String),
})
export type PaymentMethodDetailsPromptpay = typeof PaymentMethodDetailsPromptpay.Type
