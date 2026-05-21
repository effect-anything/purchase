import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingCardLifecycleControls = Schema.Struct({
  cancel_after: Schema.suspend(
    (): Schema.Schema<Models.IssuingCardLifecycleConditions, any, any> =>
      Models.IssuingCardLifecycleConditions as Schema.Schema<Models.IssuingCardLifecycleConditions, any, any>
  )
})
export type IssuingCardLifecycleControls = typeof IssuingCardLifecycleControls.Type
