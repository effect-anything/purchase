import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export type SubscriptionAutomaticTax = {
  readonly disabled_reason: "requires_location_inputs" | null
  readonly enabled: boolean
  readonly liability: Models.ConnectAccountReference | null
}

export const SubscriptionAutomaticTax = Schema.Struct({
  disabled_reason: Schema.NullOr(Schema.Literal("requires_location_inputs")),
  enabled: Schema.Boolean,
  liability: Schema.NullOr(
    Schema.suspend(
      (): Schema.Schema<Models.ConnectAccountReference, any, any> =>
        Models.ConnectAccountReference as Schema.Schema<Models.ConnectAccountReference, any, any>
    )
  )
})
