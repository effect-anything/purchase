import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const BenefitGrantError = Schema.Struct({
  message: Schema.String,
  type: Schema.String,
  timestamp: Schema.String
})
export type BenefitGrantError = typeof BenefitGrantError.Type
