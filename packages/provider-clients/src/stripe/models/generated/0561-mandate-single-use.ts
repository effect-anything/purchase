import * as Schema from "effect/Schema"

import * as Models from "../../models.ts"

export const MandateSingleUse = Schema.Struct({
  amount: Schema.Number,
  currency: Schema.String
})
export type MandateSingleUse = typeof MandateSingleUse.Type
