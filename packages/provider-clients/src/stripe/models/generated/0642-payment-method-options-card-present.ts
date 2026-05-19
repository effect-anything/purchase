import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const PaymentMethodOptionsCardPresent = Schema.Struct({
  capture_method: Schema.optional(Schema.Literal("manual", "manual_preferred")),
  request_extended_authorization: Schema.NullOr(Schema.Boolean),
  request_incremental_authorization_support: Schema.NullOr(Schema.Boolean),
  routing: Schema.optional(Schema.suspend((): typeof Models.PaymentMethodOptionsCardPresentRouting => Models.PaymentMethodOptionsCardPresentRouting)),
})
export type PaymentMethodOptionsCardPresent = typeof PaymentMethodOptionsCardPresent.Type
