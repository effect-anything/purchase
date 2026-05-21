import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type AutomaticTax = {
  readonly disabled_reason: "finalization_requires_location_inputs" | "finalization_system_error" | null
  readonly enabled: boolean
  readonly liability: Models.ConnectAccountReference | null
  readonly provider: string | null
  readonly status: "complete" | "failed" | "requires_location_inputs" | null
}

export const AutomaticTax = Schema.Struct({
  disabled_reason: Schema.NullOr(Schema.Literal("finalization_requires_location_inputs", "finalization_system_error")),
  enabled: Schema.Boolean,
  liability: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ConnectAccountReference, any, any> =>
        Models.ConnectAccountReference as Schema.Schema<Models.ConnectAccountReference, any, any>
    )
  ),
  provider: Schema.NullOr(Schema.String),
  status: Schema.NullOr(Schema.Literal("complete", "failed", "requires_location_inputs"))
})
