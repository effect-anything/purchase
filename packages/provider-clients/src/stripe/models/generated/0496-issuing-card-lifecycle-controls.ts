import * as Schema from "effect/Schema"
import * as Models from "../../models.ts"

export const IssuingCardLifecycleControls = Schema.Struct({
  cancel_after: Schema.suspend((): typeof Models.IssuingCardLifecycleConditions => Models.IssuingCardLifecycleConditions),
})
export type IssuingCardLifecycleControls = typeof IssuingCardLifecycleControls.Type
