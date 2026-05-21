import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const IssuingCardLifecycleConditions = Schema.Struct({
  payment_count: Schema.Number
})
export type IssuingCardLifecycleConditions = typeof IssuingCardLifecycleConditions.Type
