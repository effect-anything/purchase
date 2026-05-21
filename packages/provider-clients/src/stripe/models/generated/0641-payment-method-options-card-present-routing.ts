import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodOptionsCardPresentRouting = Schema.Struct({
  requested_priority: Schema.NullOr(Schema.Literal("domestic", "international"))
})
export type PaymentMethodOptionsCardPresentRouting = typeof PaymentMethodOptionsCardPresentRouting.Type
