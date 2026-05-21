import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BenefitCustomCreateProperties = Schema.Struct({
  note: Schema.optional(Schema.NullOr(Schema.NullOr(Schema.String)))
})
export type BenefitCustomCreateProperties = typeof BenefitCustomCreateProperties.Type
