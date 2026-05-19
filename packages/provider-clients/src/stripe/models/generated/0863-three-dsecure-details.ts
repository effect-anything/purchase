import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const ThreeDSecureDetails = Schema.Struct({
  authentication_flow: Schema.NullOr(Schema.Literal("challenge", "frictionless")),
  electronic_commerce_indicator: Schema.NullOr(Schema.Literal("01", "02", "05", "06", "07")),
  result: Schema.NullOr(Schema.Literal("attempt_acknowledged", "authenticated", "exempted", "failed", "not_supported", "processing_error")),
  result_reason: Schema.NullOr(Schema.Literal("abandoned", "bypassed", "canceled", "card_not_enrolled", "network_not_supported", "protocol_error", "rejected")),
  transaction_id: Schema.NullOr(Schema.String),
  version: Schema.NullOr(Schema.Literal("1.0.2", "2.1.0", "2.2.0", "2.3.0", "2.3.1")),
})
export type ThreeDSecureDetails = typeof ThreeDSecureDetails.Type
