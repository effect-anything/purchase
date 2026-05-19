import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const AutomaticTax = Schema.Struct({
  disabled_reason: Schema.NullOr(Schema.Literal("finalization_requires_location_inputs", "finalization_system_error")),
  enabled: Schema.Boolean,
  liability: Schema.NullOr(Schema.suspend((): typeof Models.ConnectAccountReference => Models.ConnectAccountReference)),
  provider: Schema.NullOr(Schema.String),
  status: Schema.NullOr(Schema.Literal("complete", "failed", "requires_location_inputs")),
})
export type AutomaticTax = typeof AutomaticTax.Type
