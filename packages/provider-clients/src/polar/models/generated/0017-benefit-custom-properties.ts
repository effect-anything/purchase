import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BenefitCustomProperties = Schema.Struct({
  note: Schema.NullOr(Schema.NullOr(Schema.String))
})
export type BenefitCustomProperties = typeof BenefitCustomProperties.Type
