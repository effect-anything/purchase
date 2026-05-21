import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const PaymentMethodDetailsCardPresentOffline = Schema.Struct({
  stored_at: Schema.NullOr(Schema.Number),
  type: Schema.NullOr(Schema.Literal("deferred"))
})
export type PaymentMethodDetailsCardPresentOffline = typeof PaymentMethodDetailsCardPresentOffline.Type
